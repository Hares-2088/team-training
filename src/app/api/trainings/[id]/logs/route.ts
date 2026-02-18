import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyToken } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await connectDB();
        const resolvedParams = await Promise.resolve(params);
        const trainingId = resolvedParams.id;
        const body = await request.json();

        if (!trainingId) {
            return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
        }

        // Get user from JWT token
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get training and its team
        const training = await Training.findById(trainingId);
        if (!training) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        // Enforce active team selection when present
        const activeTeamId = request.cookies.get('active-team')?.value;
        if (activeTeamId && String(activeTeamId) !== String(training.team)) {
            return NextResponse.json({ error: 'Training not in active team' }, { status: 403 });
        }

        const team = await Team.findById(training.team).select('trainer memberRoles members');
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const isTrainer = String(team.trainer) === currentUser.userId;
        const memberRole = (team.memberRoles || []).find((m: any) => String(m.user) === currentUser.userId)?.role;
        const isMember = team.members.some((memberId: any) => String(memberId?._id ?? memberId) === currentUser.userId);

        if (!isTrainer && !isMember && !memberRole) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const workoutLog = await WorkoutLog.create({
            training: trainingId,
            member: currentUser.userId,
            exercises: body.exercises,
            startTime: body.startTime ? new Date(body.startTime) : undefined,
            endTime: body.endTime ? new Date(body.endTime) : undefined,
            duration: body.duration,
            notes: body.notes || '',
        });

        return NextResponse.json({ workoutLog }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating workout log:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create workout log' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

        const resolvedParams = await Promise.resolve(params);
        const trainingId = resolvedParams.id;

        if (!trainingId) {
            return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
        }

        // Get training and its team
        const training = await Training.findById(trainingId);
        if (!training) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        // Check if user has access to this training's team
        const team = await Team.findById(training.team).select('trainer members memberRoles');
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Enforce active team selection when present
        const activeTeamId = request.cookies.get('active-team')?.value;
        if (activeTeamId && String(activeTeamId) !== String(team._id)) {
            return NextResponse.json({ error: 'Training not in active team' }, { status: 403 });
        }

        const isTrainer = String(team.trainer) === decoded.userId;
        const memberRole = (team.memberRoles || []).find((m: any) => String(m.user) === decoded.userId)?.role;
        const isMember = team.members.some((memberId: any) => String(memberId?._id ?? memberId) === decoded.userId);

        if (!isTrainer && !isMember && !memberRole) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const logs = await WorkoutLog.find({ training: trainingId }).sort({ createdAt: -1 });

        return NextResponse.json({ logs }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching workout logs:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workout logs' },
            { status: 500 }
        );
    }
}
