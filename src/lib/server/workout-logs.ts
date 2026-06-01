import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Training from '@/models/Training';
import WorkoutLog from '@/models/WorkoutLog';
import { getUserFromRequest } from '@/lib/auth';
import { getTeamAccess, canViewResource, toSerializable } from '@/lib/trainings/access';
import { workoutLogCreateSchema } from '@/lib/validation/training';

export async function createWorkoutLogResponse(request: NextRequest, trainingId: string) {
  const currentUser = getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const training = await Training.findById(trainingId);
  if (!training) {
    return NextResponse.json({ error: 'Training not found' }, { status: 404 });
  }

  const access = await getTeamAccess(String(training.team), currentUser.userId);
  if (!access || !canViewResource(training.toObject(), currentUser.userId, access.canManage, 'assignedTo')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const activeTeamId = request.cookies.get('active-team')?.value;
  if (activeTeamId && String(activeTeamId) !== String(training.team)) {
    return NextResponse.json({ error: 'Training not in active team' }, { status: 403 });
  }

  const parseResult = workoutLogCreateSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid workout log payload' },
      { status: 400 }
    );
  }

  const body = parseResult.data;

  const workoutLog = await WorkoutLog.create({
    training: trainingId,
    member: currentUser.userId,
    exercises: body.exercises,
    startTime: body.startTime ? new Date(body.startTime) : undefined,
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    duration: body.duration,
    notes: body.notes,
    sessionFeeling: body.sessionFeeling,
    completionStatus: body.completionStatus,
    skippedExercises: body.skippedExercises,
    overallFeedback: body.overallFeedback,
  });

  return NextResponse.json({ workoutLog: toSerializable(workoutLog.toObject()) }, { status: 201 });
}

export async function getWorkoutLogsResponse(request: NextRequest, trainingId: string) {
  const currentUser = getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const training = await Training.findById(trainingId);
  if (!training) {
    return NextResponse.json({ error: 'Training not found' }, { status: 404 });
  }

  const access = await getTeamAccess(String(training.team), currentUser.userId);
  if (!access || !canViewResource(training.toObject(), currentUser.userId, access.canManage, 'assignedTo')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const activeTeamId = request.cookies.get('active-team')?.value;
  if (activeTeamId && String(activeTeamId) !== String(training.team)) {
    return NextResponse.json({ error: 'Training not in active team' }, { status: 403 });
  }

  const logQuery = access.canManage ? { training: trainingId } : { training: trainingId, member: currentUser.userId };
  const logs = await WorkoutLog.find(logQuery)
    .populate('member', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ logs: toSerializable(logs) }, { status: 200 });
}
