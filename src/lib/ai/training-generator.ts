import { addDays } from 'date-fns';
import {
  aiGeneratedPlanSchema,
  type AIGeneratedPlan,
  type TrainingGenerationRequestInput,
} from '@/lib/validation/training';

type GeneratorContext = {
  memberName: string;
  requesterName: string;
  recentTrainings: Array<{ title: string; scheduledDate: string; dayFocus?: string }>;
  recentLogs: Array<{
    completedAt: string;
    sessionFeeling?: string;
    completionStatus?: string;
    overallFeedback?: string;
    skippedExercises?: string[];
  }>;
  progressImages: Array<{ fileName: string; capturedAt?: string; note?: string }>;
};

type GeneratorResult = {
  plan: AIGeneratedPlan;
  generator: {
    provider: 'openai' | 'fallback';
    model: string;
    source: 'ai' | 'ai-fallback';
  };
  promptPreview: string;
};

const SAFETY_RULES = [
  'Do not prescribe medical treatment or diagnose injuries.',
  'Keep intensity conservative when injuries or fatigue are mentioned.',
  'Prefer clear warm-ups, gradual progression, and technique-first exercise choices.',
  'Return concise JSON only with realistic training content.',
].join(' ');

const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

function getNextDates(days: string[], weeks: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedIndices = days
    .map((day) => WEEKDAY_ORDER.indexOf(day as (typeof WEEKDAY_ORDER)[number]))
    .filter((index) => index >= 0);

  const dates: string[] = [];
  let cursor = new Date(today);

  while (dates.length < Math.max(days.length, Math.min(days.length * weeks, 7))) {
    const weekdayIndex = (cursor.getDay() + 6) % 7;
    if (selectedIndices.includes(weekdayIndex)) {
      dates.push(cursor.toISOString());
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function buildFallbackPlan(
  input: TrainingGenerationRequestInput,
  context: GeneratorContext
): AIGeneratedPlan {
  const dates = getNextDates(input.availability, input.weeks);
  const focusRotation = ['Strength base', 'Hypertrophy', 'Conditioning', 'Recovery'];

  const trainings = dates.map((scheduledDate, index) => {
    const focus = focusRotation[index % focusRotation.length];
    const isConditioning = focus === 'Conditioning';

    return {
      title: `${input.title} — ${input.availability[index % input.availability.length]}`,
      description: `Focused ${focus.toLowerCase()} session for ${context.memberName}.`,
      scheduledDate,
      dayFocus: focus,
      warmup: [
        '5 minutes easy cardio',
        'Dynamic mobility for hips, shoulders, and ankles',
        '2 ramp-up sets for the first exercise',
      ],
      cardioBlock: isConditioning
        ? {
            type: 'Intervals',
            durationMinutes: 18,
            intensity: 'Moderate to challenging',
            instructions: 'Alternate 1 minute hard effort with 2 minutes easy recovery.',
          }
        : {
            type: 'Zone 2',
            durationMinutes: 12,
            intensity: 'Easy conversational pace',
            instructions: 'Keep breathing steady and posture relaxed.',
          },
      intensityNotes: input.injuries
        ? 'Stay 1-2 reps in reserve and reduce load if discomfort appears.'
        : 'Aim for solid technique and finish each main set with 1-3 reps in reserve.',
      instructions: [
        'Rest 60-90 seconds between accessory movements.',
        'Log weight, reps, and how the session felt.',
        'Adjust load down if form breaks or pain appears.',
      ],
      exercises: isConditioning
        ? [
            { name: 'Goblet Squat', sets: 3, reps: '10', restTime: 75, notes: 'Controlled depth' },
            { name: 'Push-Up', sets: 3, reps: '8-12', restTime: 60, notes: 'Elevate hands if needed' },
            { name: 'Seated Row', sets: 3, reps: '12', restTime: 75, notes: 'Pause at contraction' },
            { name: 'Dead Bug', sets: 3, reps: '10/side', restTime: 45, notes: 'Keep ribs down' },
          ]
        : [
            { name: 'Squat Variation', sets: 4, reps: '6-8', restTime: 120, notes: 'Progress load slowly' },
            { name: 'Bench Press Variation', sets: 4, reps: '6-8', restTime: 120, notes: 'Smooth tempo' },
            { name: 'Romanian Deadlift', sets: 3, reps: '8-10', restTime: 90, notes: 'Maintain neutral spine' },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12', restTime: 75, notes: 'Control the lowering phase' },
          ],
    };
  });

  return aiGeneratedPlanSchema.parse({
    title: input.title,
    description: `AI-assisted plan for ${context.memberName} built from goals, availability, and recent training history.`,
    goalSummary: input.goalSummary,
    weeklyStructure: input.availability.map(
      (day, index) => `${day}: ${focusRotation[index % focusRotation.length]}`
    ),
    progressionNotes:
      'Increase load or reps only when all sets feel controlled and recovery stays good.',
    cardioSummary:
      'Blend low-intensity conditioning with short interval work based on weekly focus.',
    safetyNotes: input.injuries
      ? `Respect these limitations: ${input.injuries}. Stop or regress movements that cause pain.`
      : 'Prioritize technique, warm up well, and stop sets early if form degrades.',
    trainings,
  });
}

function buildPrompt(input: TrainingGenerationRequestInput, context: GeneratorContext): string {
  return [
    `Create a ${input.weeks}-week training plan for ${context.memberName}.`,
    `Requested by: ${context.requesterName}`,
    `Goal summary: ${input.goalSummary}`,
    `Availability: ${input.availability.join(', ')}`,
    `Preferences: ${input.preferences || 'None provided'}`,
    `Injuries or restrictions: ${input.injuries || 'None provided'}`,
    `Additional notes: ${input.notes || 'None provided'}`,
    `Recent trainings: ${context.recentTrainings
      .map((training) => `${training.title} (${training.scheduledDate})`)
      .join('; ') || 'None'}`,
    `Recent logs: ${context.recentLogs
      .map(
        (log) =>
          `${log.completedAt}: ${log.sessionFeeling || 'n/a'} / ${log.completionStatus || 'n/a'} / ${log.overallFeedback || 'no notes'}`
      )
      .join('; ') || 'None'}`,
    `Progress images: ${context.progressImages
      .map((image) => `${image.fileName}${image.note ? ` (${image.note})` : ''}`)
      .join('; ') || 'None'}`,
    `Safety rules: ${SAFETY_RULES}`,
    'Return JSON with keys: title, description, goalSummary, weeklyStructure, progressionNotes, cardioSummary, safetyNotes, trainings.',
    'Each training must include title, description, scheduledDate, exercises, warmup, dayFocus, cardioBlock, intensityNotes, instructions.',
  ].join('\n');
}

async function generateWithOpenAI(
  prompt: string,
  input: TrainingGenerationRequestInput,
  context: GeneratorContext
): Promise<GeneratorResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a careful strength coach. Produce safe, structured JSON only. Keep schedules realistic and avoid medical advice.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      return null;
    }

    const parsed = aiGeneratedPlanSchema.parse(JSON.parse(rawContent));
    return {
      plan: parsed,
      generator: { provider: 'openai', model, source: 'ai' },
      promptPreview: prompt,
    };
  } catch {
    return {
      plan: buildFallbackPlan(input, context),
      generator: {
        provider: 'fallback',
        model: 'deterministic-fallback',
        source: 'ai-fallback',
      },
      promptPreview: prompt,
    };
  }
}

export async function generateTrainingPlan(
  input: TrainingGenerationRequestInput,
  context: GeneratorContext
): Promise<GeneratorResult> {
  const prompt = buildPrompt(input, context);
  const openAIResult = await generateWithOpenAI(prompt, input, context);
  if (openAIResult) {
    return openAIResult;
  }

  return {
    plan: buildFallbackPlan(input, context),
    generator: {
      provider: 'fallback',
      model: 'deterministic-fallback',
      source: 'ai-fallback',
    },
    promptPreview: prompt,
  };
}
