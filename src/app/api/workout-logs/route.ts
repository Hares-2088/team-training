import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Team from '@/models/Team';
import Training from '@/models/Training';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get user from JWT token
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const activeTeamId = request.cookies.get('active-team')?.value || null;

        // Members/coaches: always can see their own logs (all teams)
        // Trainers: scope to their teams; if active team set, narrow to it

        let workoutLogs;

        if (activeTeamId) {
            const activeTeam = await Team.findById(activeTeamId);
            if (activeTeam && String(activeTeam.trainer) === currentUser.userId) {
                const trainings = await Training.find({ team: activeTeamId });
                const trainingIds = trainings.map((t) => t._id);
                workoutLogs = await WorkoutLog.find({ training: { $in: trainingIds } })
                    .populate('training', 'title scheduledDate')
                    .populate('member', 'name')
                    .sort({ completedAt: -1 });
            } else {
                workoutLogs = await WorkoutLog.find({ member: currentUser.userId })
                    .populate('training', 'title scheduledDate')
                    .populate('member', 'name')
                    .sort({ completedAt: -1 });
            }
        } else if (currentUser.role === 'trainer') {
            const teams = await Team.find({ trainer: currentUser.userId });
            const teamIds = teams.map((t) => t._id);
            const trainings = await Training.find({ team: { $in: teamIds } });
            const trainingIds = trainings.map((t) => t._id);

            workoutLogs = await WorkoutLog.find({ training: { $in: trainingIds } })
                .populate('training', 'title scheduledDate')
                .populate('member', 'name')
                .sort({ completedAt: -1 });
        } else {
            workoutLogs = await WorkoutLog.find({ member: currentUser.userId })
                .populate('training', 'title scheduledDate')
                .populate('member', 'name')
                .sort({ completedAt: -1 });
        }

        return NextResponse.json(workoutLogs);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
    }
}
