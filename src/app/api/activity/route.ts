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

        const activeTeamId = request.cookies.get('active-team')?.value;
        const isTrainer = decoded.role === 'trainer' || false;

        if (isTrainer) {
            // Get all teams for this trainer
            const teamQuery = activeTeamId ? { _id: activeTeamId, trainer: decoded.userId } : { trainer: decoded.userId };
            const teams = await Team.find(teamQuery);
            const teamIds = teams.map((t) => t._id);

            console.log('Trainer activity - Teams found:', teamIds.length, 'Team IDs:', teamIds);

            if (teamIds.length === 0) {
                return NextResponse.json({ activity: [], isTrainer: true });
            }

            // Get all members in trainer's teams
            const memberIds = teams.flatMap((t) => t.members);

            // Get all workout logs by members in these teams (regardless of training)
            const logs = await WorkoutLog.find({
                member: { $in: memberIds }
            })
                .populate('member', 'name')
                .populate('training', 'team title')
                .sort({ createdAt: -1 });

            console.log('Trainer activity - Logs found:', logs.length);

            // Group by date and team, filtering only logs from trainer's teams
            const activityByDateAndTeam: {
                [key: string]: { [key: string]: Set<string> };
            } = {};

            logs.forEach((log) => {
                // Check if training exists and belongs to trainer's teams
                if (!log.training || !log.training.team) {
                    console.log('Skipping log - training not found or missing team:', log._id);
                    return;
                }

                const trainingTeamId = log.training.team.toString();
                if (!teamIds.some(tId => tId.toString() === trainingTeamId)) {
                    console.log('Skipping log - training not in trainer teams:', log._id);
                    return;
                }

                const date = log.createdAt
                    ? new Date(log.createdAt).toISOString().split('T')[0]
                    : 'Unknown';

                // Find team name
                const team = teams.find((t) => t._id.toString() === trainingTeamId);
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

            console.log('Trainer activity - Formatted data:', formattedData);

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
