import { connectDB } from '@/lib/db/mongodb';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
        }

        const training = await Training.findById(id);

        if (!training) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        // Directly check team membership to avoid false 403s
        const team = await Team.findById(training.team)
            .populate('members', '_id')
            .select('trainer members');

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const isTrainer = String(team.trainer) === String(decoded.userId);
        const isMember = team.members.some((member: any) => String(member?._id ?? member) === String(decoded.userId));

        if (!isTrainer && !isMember) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ training }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching training:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch training' },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
        const id = resolvedParams.id;
        const body = await request.json();

        const training = await Training.findById(id);
        if (!training) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        // Check if user is the trainer of the training's team
        const team = await Team.findById(training.team);
        if (!team || team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updates: Record<string, unknown> = {};
        const allowedFields = ['title', 'description', 'exercises', 'scheduledDate', 'status'];

        for (const field of allowedFields) {
            if (field in body) {
                updates[field] = field === 'scheduledDate' ? new Date(body[field]) : body[field];
            }
        }

        const updatedTraining = await Training.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedTraining) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        return NextResponse.json({ training: updatedTraining }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating training:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update training' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
        const id = resolvedParams.id;

        const training = await Training.findById(id);
        if (!training) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        // Check if user is the trainer of the training's team
        const team = await Team.findById(training.team);
        if (!team || team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const deletedTraining = await Training.findByIdAndDelete(id);

        if (!deletedTraining) {
            return NextResponse.json({ error: 'Training not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Training deleted' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting training:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete training' },
            { status: 500 }
        );
    }
}
