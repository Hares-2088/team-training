import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Training from '@/models/Training';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
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

        // Get params
        const { id: teamId, memberId } = await params;

        // Verify that the trainer owns this team
        const team = await Team.findById(teamId);
        if (!team || team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Team not found or access denied' }, { status: 403 });
        }

        // Verify that the member belongs to this team
        const isMemberInTeam = team.members.some((m: any) => m.toString() === memberId);
        if (!isMemberInTeam) {
            return NextResponse.json({ error: 'Member not in this team' }, { status: 403 });
        }

        // Get all trainings for this team
        const trainings = await Training.find({ team: teamId });
        const trainingIds = trainings.map((t) => t._id);

        // Get all workout logs for this member
        const logs = await WorkoutLog.find({
            member: memberId,
            training: { $in: trainingIds },
        })
            .populate('training', 'title')
            .sort({ createdAt: -1 });

        // Get member details
        const member = await User.findById(memberId);

        // Format the data
        const formattedData = logs.map((log) => ({
            id: log._id,
            date: log.createdAt,
            trainingTitle: log.training?.title || 'Unknown Training',
        }));

        return NextResponse.json({
            member: {
                _id: member._id,
                name: member.name,
                email: member.email,
            },
            logs: formattedData,
            totalLogs: formattedData.length,
        });
    } catch (error: any) {
        console.error('Error fetching member logs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch member logs' },
            { status: 500 }
        );
    }
}
