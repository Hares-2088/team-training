import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Team from '@/models/Team';
import Training from '@/models/Training';
import { getUserFromRequest } from '@/lib/auth';
import { getAccessFlags, stringifyId, toSerializable } from '@/lib/trainings/access';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const mineOnly = url.searchParams.get('mine') === 'true';
    const activeTeamId = request.cookies.get('active-team')?.value || null;

    if (mineOnly) {
      const ownLogs = await WorkoutLog.find({ member: currentUser.userId })
        .populate('training', 'title scheduledDate dayFocus')
        .populate('member', 'name')
        .sort({ completedAt: -1 })
        .lean();
      return NextResponse.json(toSerializable(ownLogs));
    }

    if (activeTeamId) {
      const team = await Team.findById(activeTeamId).select('trainer members memberRoles').lean();
      if (team) {
        const access = getAccessFlags(team, currentUser.userId);
        if (access.canManage) {
          const trainings = await Training.find({ team: activeTeamId }).select('_id').lean();
          const trainingIds = trainings.map((training) => training._id);
          const logs = await WorkoutLog.find({ training: { $in: trainingIds } })
            .populate('training', 'title scheduledDate dayFocus assignedTo')
            .populate('member', 'name')
            .sort({ completedAt: -1 })
            .lean();
          return NextResponse.json(toSerializable(logs));
        }
      }
    }

    const workoutLogs = await WorkoutLog.find({ member: currentUser.userId })
      .populate('training', 'title scheduledDate dayFocus')
      .populate('member', 'name')
      .sort({ completedAt: -1 })
      .lean();

    return NextResponse.json(toSerializable(workoutLogs));
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
  }
}
