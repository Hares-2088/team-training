import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Training from '@/models/Training';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string; logId: string }> }
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
        const { id: teamId, memberId, logId } = await params;

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

        // Get the workout log
        const log = await WorkoutLog.findById(logId)
            .populate('training', 'title')
            .populate('member', 'name email');

        if (!log) {
            return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
        }

        // Verify the log belongs to the member
        if (log.member._id.toString() !== memberId) {
            return NextResponse.json({ error: 'Workout log does not belong to this member' }, { status: 403 });
        }

        return NextResponse.json({
            log: {
                _id: log._id,
                trainingTitle: log.training?.title || 'Unknown Training',
                memberName: log.member?.name || 'Unknown Member',
                startTime: log.startTime,
                endTime: log.endTime,
                duration: log.duration,
                completedAt: log.completedAt,
                notes: log.notes,
                exercises: log.exercises,
            },
        });
    } catch (error: any) {
        console.error('Error fetching workout log details:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workout log details' },
            { status: 500 }
        );
    }
}
