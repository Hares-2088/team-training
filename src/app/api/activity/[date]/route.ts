import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Training from '@/models/Training';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
    try {
        await connectDB();

        // Get user from token
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'trainer') {
            return NextResponse.json({ error: 'Only trainers can view this' }, { status: 403 });
        }

        // Get the date parameter and parse it correctly
        const { date: dateStr } = await params;
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
        const dateEnd = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

        // Get all teams for this trainer
        const teams = await Team.find({ trainer: decoded.userId });
        const teamIds = teams.map((t) => t._id);

        // Get all trainings for these teams
        const trainings = await Training.find({ team: { $in: teamIds } });
        const trainingIds = trainings.map((t) => t._id);

        // Get all workout logs for this date
        const logs = await WorkoutLog.find({
            training: { $in: trainingIds },
            createdAt: {
                $gte: dateStart,
                $lt: dateEnd,
            },
        })
            .populate('member', 'name')
            .populate('training', 'title team')
            .sort({ createdAt: -1 });

        // Format the data
        const activityByMember: {
            [memberId: string]: {
                memberName: string;
                team: string;
                trainings: string[];
            };
        } = {};

        for (const log of logs) {
            const memberId = log.member?._id?.toString() || 'Unknown';
            const memberName = log.member?.name || 'Unknown Member';
            const training = trainings.find((t) => t._id.toString() === log.training?._id?.toString());
            const team = teams.find((t) => t._id.toString() === training?.team?.toString());
            const teamName = team?.name || 'Unknown Team';
            const trainingTitle = log.training?.title || 'Unknown Training';

            if (!activityByMember[memberId]) {
                activityByMember[memberId] = {
                    memberName,
                    team: teamName,
                    trainings: [],
                };
            }

            activityByMember[memberId].trainings.push(trainingTitle);
        }

        const formattedData = Object.entries(activityByMember).map(([memberId, data]) => ({
            memberId,
            ...data,
        }));

        return NextResponse.json({
            date: dateStr,
            members: formattedData,
            totalMembers: formattedData.length,
        });
    } catch (error: any) {
        console.error('Error fetching activity details:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch activity details' },
            { status: 500 }
        );
    }
}
