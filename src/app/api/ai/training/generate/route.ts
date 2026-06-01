import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import { generateTrainingPlan } from '@/lib/ai/training-generator';
import { stringifyId, getTeamAccess, toSerializable } from '@/lib/trainings/access';
import { aiGeneratedPlanSchema, trainingGenerationRequestSchema } from '@/lib/validation/training';
import Training from '@/models/Training';
import TrainingGenerationRequest from '@/models/TrainingGenerationRequest';
import User from '@/models/User';
import UserProgressImage from '@/models/UserProgressImage';
import WorkoutLog from '@/models/WorkoutLog';
import WorkoutPlan from '@/models/WorkoutPlan';

export async function POST(request: NextRequest) {
  await connectDB();

  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const parseResult = trainingGenerationRequestSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid generation payload' },
      { status: 400 }
    );
  }

  const body = parseResult.data;
  const access = await getTeamAccess(body.teamId, decoded.userId);
  if (!access) {
    return NextResponse.json({ error: 'Unauthorized for team' }, { status: 403 });
  }

  if (!access.canManage && body.targetUserId !== decoded.userId) {
    return NextResponse.json({ error: 'You can only generate plans for yourself' }, { status: 403 });
  }

  if (!access.canManage && !body.isPersonal) {
    return NextResponse.json(
      { error: 'Only team trainer or coach can generate shared team plans' },
      { status: 403 }
    );
  }

  if (body.targetUserId !== access.team.trainer && !access.team.members.includes(body.targetUserId)) {
    return NextResponse.json({ error: 'Target user must belong to the selected team' }, { status: 400 });
  }

  const [requester, member, recentTrainings, recentLogs, progressImages] = await Promise.all([
    User.findById(decoded.userId).select('name email').lean(),
    User.findById(body.targetUserId).select('name email').lean(),
    Training.find({
      team: body.teamId,
      $or: [
        { assignedTo: body.targetUserId },
        { createdBy: body.targetUserId },
        { isPersonal: { $ne: true }, assignedTo: null },
        { isPersonal: { $ne: true }, assignedTo: { $exists: false } },
      ],
    })
      .select('title scheduledDate dayFocus')
      .sort({ scheduledDate: -1 })
      .limit(8)
      .lean(),
    WorkoutLog.find({ member: body.targetUserId })
      .select('completedAt sessionFeeling completionStatus overallFeedback skippedExercises')
      .sort({ completedAt: -1 })
      .limit(8)
      .lean(),
    UserProgressImage.find({
      _id: { $in: body.uploadedImageIds },
      owner: body.targetUserId,
      team: body.teamId,
    })
      .select('fileName capturedAt note')
      .lean(),
  ]);

  if (!requester || !member) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const generationRequest = await TrainingGenerationRequest.create({
    team: body.teamId,
    requestedBy: decoded.userId,
    targetUser: body.targetUserId,
    generator: {
      provider: 'openai',
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      source: 'ai',
    },
    status: 'pending',
    inputPayload: {
      title: body.title,
      goalSummary: body.goalSummary,
      availability: body.availability,
      weeks: body.weeks,
      preferences: body.preferences,
      injuries: body.injuries,
      notes: body.notes,
      uploadedImageIds: body.uploadedImageIds,
      isPersonal: body.isPersonal,
    },
    requestSnapshot: {
      body,
      context: {
        memberName: member.name,
        requesterName: requester.name,
        recentTrainings: toSerializable(recentTrainings),
        recentLogs: toSerializable(recentLogs),
        progressImages: toSerializable(progressImages),
      },
    },
  });

  try {
    const generation = await generateTrainingPlan(body, {
      memberName: member.name,
      requesterName: requester.name,
      recentTrainings: recentTrainings.map((training) => ({
        title: training.title,
        scheduledDate: new Date(training.scheduledDate).toISOString(),
        dayFocus: training.dayFocus || undefined,
      })),
      recentLogs: recentLogs.map((log) => ({
        completedAt: new Date(log.completedAt).toISOString(),
        sessionFeeling: log.sessionFeeling || undefined,
        completionStatus: log.completionStatus || undefined,
        overallFeedback: log.overallFeedback || undefined,
        skippedExercises: log.skippedExercises || [],
      })),
      progressImages: progressImages.map((image) => ({
        fileName: image.fileName,
        capturedAt: image.capturedAt ? new Date(image.capturedAt).toISOString() : undefined,
        note: image.note || undefined,
      })),
    });

    const validatedPlan = aiGeneratedPlanSchema.parse(generation.plan);

    const plan = await WorkoutPlan.create({
      title: validatedPlan.title,
      description: validatedPlan.description,
      team: body.teamId,
      isPersonal: body.isPersonal,
      createdBy: decoded.userId,
      assignee: body.targetUserId,
      goalSummary: validatedPlan.goalSummary,
      weeklyStructure: validatedPlan.weeklyStructure,
      progressionNotes: validatedPlan.progressionNotes,
      cardioSummary: validatedPlan.cardioSummary,
      safetyNotes: validatedPlan.safetyNotes,
      generationSource: generation.generator.source,
      aiMetadata: {
        generatedAt: new Date(),
        generator: generation.generator.provider,
        model: generation.generator.model,
        requestId: generationRequest._id,
        promptVersion: 'v1',
        notes: generation.promptPreview.slice(0, 500),
      },
    });

    const trainings = await Training.insertMany(
      validatedPlan.trainings.map((training) => ({
        title: training.title,
        description: training.description,
        exercises: training.exercises,
        team: body.teamId,
        scheduledDate: new Date(training.scheduledDate),
        status: training.status,
        isPersonal: body.isPersonal,
        createdBy: decoded.userId,
        assignedTo: training.assignedTo || body.targetUserId,
        plan: plan._id,
        warmup: training.warmup,
        dayFocus: training.dayFocus,
        cardioBlock: training.cardioBlock,
        intensityNotes: training.intensityNotes,
        instructions: training.instructions,
      }))
    );

    await TrainingGenerationRequest.findByIdAndUpdate(generationRequest._id, {
      status: 'completed',
      generator: generation.generator,
      responseSnapshot: validatedPlan,
      createdPlan: plan._id,
    });

    if (body.uploadedImageIds.length > 0) {
      await UserProgressImage.updateMany(
        { _id: { $in: body.uploadedImageIds } },
        { generationRequest: generationRequest._id, workoutPlan: plan._id }
      );
    }

    return NextResponse.json(
      {
        plan: toSerializable(plan.toObject()),
        trainings: toSerializable(trainings.map((training) => training.toObject())),
        generationRequestId: stringifyId(generationRequest._id),
      },
      { status: 201 }
    );
  } catch (error) {
    await TrainingGenerationRequest.findByIdAndUpdate(generationRequest._id, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Generation failed',
    });

    const message = error instanceof Error ? error.message : 'Failed to generate training plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
