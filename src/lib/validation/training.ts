import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const weekdaySchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Exercise name is required'),
  sets: z.coerce.number().int().min(1).max(20),
  reps: z.string().trim().min(1, 'Reps are required'),
  restTime: z.coerce.number().int().min(0).max(900).default(90),
  notes: z.string().trim().max(500).optional().default(''),
});

export const cardioBlockSchema = z.object({
  type: z.string().trim().max(120).optional().default(''),
  durationMinutes: z.coerce.number().int().min(0).max(240).optional(),
  intensity: z.string().trim().max(200).optional().default(''),
  instructions: z.string().trim().max(1000).optional().default(''),
});

export const trainingContentSchema = z.object({
  title: z.string().trim().min(1, 'Training title is required'),
  description: z.string().trim().max(2000).optional().default(''),
  scheduledDate: z.string().trim().min(1, 'Scheduled date is required'),
  exercises: z.array(exerciseSchema).default([]),
  warmup: z.array(z.string().trim().min(1)).default([]),
  dayFocus: z.string().trim().max(300).optional().default(''),
  cardioBlock: cardioBlockSchema.optional(),
  intensityNotes: z.string().trim().max(500).optional().default(''),
  instructions: z.array(z.string().trim().min(1)).default([]),
  assignedTo: objectIdSchema.optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional().default('scheduled'),
});

export const aiGeneratedPlanSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().max(2000).optional().default(''),
  goalSummary: z.string().trim().min(1),
  weeklyStructure: z.array(z.string().trim().min(1)).min(1).max(14),
  progressionNotes: z.string().trim().max(1200).optional().default(''),
  cardioSummary: z.string().trim().max(1200).optional().default(''),
  safetyNotes: z.string().trim().max(1200).optional().default(''),
  trainings: z.array(trainingContentSchema).min(1).max(14),
});

export const trainingGenerationRequestSchema = z.object({
  teamId: objectIdSchema,
  targetUserId: objectIdSchema,
  title: z.string().trim().min(1).max(160),
  goalSummary: z.string().trim().min(1).max(1000),
  availability: z.array(weekdaySchema).min(1).max(7),
  weeks: z.coerce.number().int().min(1).max(12).default(4),
  preferences: z.string().trim().max(1500).optional().default(''),
  injuries: z.string().trim().max(1500).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  isPersonal: z.boolean().optional().default(false),
  uploadedImageIds: z.array(objectIdSchema).max(5).optional().default([]),
});

export const workoutPlanCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  team: objectIdSchema,
  isPersonal: z.boolean().optional().default(false),
  assignee: objectIdSchema.optional(),
  goalSummary: z.string().trim().max(1000).optional().default(''),
  weeklyStructure: z.array(z.string().trim().min(1)).max(14).optional().default([]),
  progressionNotes: z.string().trim().max(1200).optional().default(''),
  cardioSummary: z.string().trim().max(1200).optional().default(''),
  safetyNotes: z.string().trim().max(1200).optional().default(''),
  generationSource: z.enum(['manual', 'ai', 'ai-fallback']).optional().default('manual'),
  aiMetadata: z
    .object({
      generatedAt: z.string().datetime().optional(),
      generator: z.string().trim().max(120).optional().default(''),
      model: z.string().trim().max(120).optional().default(''),
      requestId: objectIdSchema.optional(),
      promptVersion: z.string().trim().max(40).optional().default(''),
      notes: z.string().trim().max(500).optional().default(''),
    })
    .optional(),
});

export const workoutPlanUpdateSchema = workoutPlanCreateSchema.partial().omit({ team: true });

export const trainingCreateSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  exercises: z.array(exerciseSchema).optional().default([]),
  team: objectIdSchema,
  scheduledDate: z.string().trim().min(1),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional().default('scheduled'),
  isPersonal: z.boolean().optional().default(false),
  planId: objectIdSchema.optional(),
  assignedTo: objectIdSchema.optional(),
  warmup: z.array(z.string().trim().min(1)).optional().default([]),
  dayFocus: z.string().trim().max(300).optional().default(''),
  cardioBlock: cardioBlockSchema.optional(),
  intensityNotes: z.string().trim().max(500).optional().default(''),
  instructions: z.array(z.string().trim().min(1)).optional().default([]),
});

export const trainingUpdateSchema = trainingCreateSchema.partial().omit({ team: true });

export const workoutLogExerciseSchema = z.object({
  exerciseName: z.string().trim().min(1),
  setNumber: z.coerce.number().int().min(1),
  weight: z.coerce.number().min(0),
  weightUnit: z.enum(['lbs', 'kg', 'bodyweight']).default('lbs'),
  reps: z.coerce.number().int().min(0),
  rpe: z.coerce.number().min(1).max(10).optional(),
  notes: z.string().trim().max(500).optional().default(''),
});

export const workoutLogCreateSchema = z.object({
  exercises: z.array(workoutLogExerciseSchema).default([]),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  duration: z.coerce.number().int().min(0).optional(),
  notes: z.string().trim().max(2000).optional().default(''),
  sessionFeeling: z.enum(['great', 'good', 'okay', 'low', 'bad']).optional(),
  completionStatus: z.enum(['completed', 'partial', 'skipped']).optional().default('completed'),
  skippedExercises: z.array(z.string().trim().min(1)).optional().default([]),
  overallFeedback: z.string().trim().max(1500).optional().default(''),
});

export const progressImageUploadSchema = z.object({
  teamId: objectIdSchema,
  note: z.string().trim().max(500).optional().default(''),
  capturedAt: z.string().datetime().optional(),
  generationRequestId: objectIdSchema.optional(),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type TrainingContentInput = z.infer<typeof trainingContentSchema>;
export type AIGeneratedPlan = z.infer<typeof aiGeneratedPlanSchema>;
export type TrainingGenerationRequestInput = z.infer<typeof trainingGenerationRequestSchema>;
export type WorkoutPlanCreateInput = z.infer<typeof workoutPlanCreateSchema>;
export type WorkoutPlanUpdateInput = z.infer<typeof workoutPlanUpdateSchema>;
export type TrainingCreateInput = z.infer<typeof trainingCreateSchema>;
export type TrainingUpdateInput = z.infer<typeof trainingUpdateSchema>;
export type WorkoutLogCreateInput = z.infer<typeof workoutLogCreateSchema>;
export type ProgressImageUploadInput = z.infer<typeof progressImageUploadSchema>;
export type Weekday = z.infer<typeof weekdaySchema>;
