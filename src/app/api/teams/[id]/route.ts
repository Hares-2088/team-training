import { connectDB } from '@/lib/db/mongodb';
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
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }

        const team = await Team.findById(id)
            .populate('trainer', 'name email')
            .populate('members', 'name email role');

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Check if user is the trainer or a member of this team
        const isTrainer = team.trainer._id.toString() === decoded.userId;
        const isMember = team.members.some((member: any) => member._id.toString() === decoded.userId);

        if (!isTrainer && !isMember) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ team }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching team:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch team' },
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

        const team = await Team.findById(id);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Check if user is the trainer of this team
        if (team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized - only team trainer can edit' }, { status: 403 });
        }

        const updates: Record<string, unknown> = {};
        const allowedFields = ['name', 'description'];

        for (const field of allowedFields) {
            if (field in body) {
                updates[field] = body[field];
            }
        }

        const updatedTeam = await Team.findByIdAndUpdate(id, updates, { new: true })
            .populate('trainer', 'name email')
            .populate('members', 'name email role');

        if (!updatedTeam) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ team: updatedTeam }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating team:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update team' },
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

        const team = await Team.findById(id);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Check if user is the trainer of this team
        if (team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized - only team trainer can delete' }, { status: 403 });
        }

        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Team deleted' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting team:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete team' },
            { status: 500 }
        );
    }
}
