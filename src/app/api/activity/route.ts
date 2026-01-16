import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get user from token
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const isTrainer = decoded.role === 'trainer';

        if (isTrainer) {
            // Get all teams for this trainer
            const teams = await Team.find({ trainer: decoded.userId });
            const teamIds = teams.map((t) => t._id);

            // Get all workout logs for trainings in these teams
            const trainings = await Training.find({ team: { $in: teamIds } });
            const trainingIds = trainings.map((t) => t._id);

            const logs = await WorkoutLog.find({
                training: { $in: trainingIds },
            })
                .populate('member', 'name')
                .populate('training', 'team')
                .sort({ createdAt: -1 });

            // Group by date and team
            const activityByDateAndTeam: {
                [key: string]: { [key: string]: Set<string> };
            } = {};

            logs.forEach((log) => {
                const date = log.createdAt
                    ? new Date(log.createdAt).toISOString().split('T')[0]
                    : 'Unknown';

                // Find team name for this log
                const training = trainings.find((t) => t._id.toString() === log.training?._id?.toString());
                const team = teams.find((t) => t._id.toString() === training?.team?.toString());
                const teamName = team?.name || 'Unknown Team';

                if (!activityByDateAndTeam[date]) {
                    activityByDateAndTeam[date] = {};
                }

                if (!activityByDateAndTeam[date][teamName]) {
                    activityByDateAndTeam[date][teamName] = new Set();
                }

                activityByDateAndTeam[date][teamName].add(log.member?._id?.toString() || 'Unknown');
            });

            // Convert Sets to counts
            const formattedData = Object.entries(activityByDateAndTeam).map(([date, teamData]) => ({
                date,
                ...Object.fromEntries(
                    Object.entries(teamData).map(([team, members]) => [team, members.size])
                ),
            }));

            return NextResponse.json({ activity: formattedData, isTrainer: true });
        } else {
            // Member: get their own workout logs
            const logs = await WorkoutLog.find({ member: decoded.userId })
                .populate('training', 'title')
                .sort({ createdAt: -1 });

            // Group by date
            const activityByDate: { [key: string]: number } = {};

            logs.forEach((log) => {
                const date = log.createdAt
                    ? new Date(log.createdAt).toISOString().split('T')[0]
                    : 'Unknown';

                if (!activityByDate[date]) {
                    activityByDate[date] = 0;
                }
                activityByDate[date]++;
            });

            const formattedData = Object.entries(activityByDate).map(([date, count]) => ({
                date,
                workouts: count,
            }));

            return NextResponse.json({ activity: formattedData, isTrainer: false });
        }
    } catch (error: any) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch activity' },
            { status: 500 }
        );
    }
}
