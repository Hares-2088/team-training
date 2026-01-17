import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
) {
    try {
        await connectDB();
        const resolvedParams = await Promise.resolve(params);
        const { id, memberId } = resolvedParams;

        if (!id || !memberId) {
            return NextResponse.json({ error: 'Team ID and Member ID are required' }, { status: 400 });
        }

        const team = await Team.findByIdAndUpdate(
            id,
            { $pull: { members: memberId } },
            { new: true }
        )
            .populate('trainer', 'name email')
            .populate('members', 'name email');

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ team }, { status: 200 });
    } catch (error: any) {
        console.error('Error removing member:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove member' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
) {
    try {
        await connectDB();
        const resolvedParams = await Promise.resolve(params);
        const { id, memberId } = resolvedParams;

        if (!id || !memberId) {
            return NextResponse.json({ error: 'Team ID and Member ID are required' }, { status: 400 });
        }

        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { role } = await request.json();
        if (!role || !['member', 'coach'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const team = await Team.findById(id).populate('members', '_id role');
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized - only team trainer can change member roles' }, { status: 403 });
        }

        const isMember = team.members.some((m: any) => String(m?._id ?? m) === memberId);
        if (!isMember) {
            return NextResponse.json({ error: 'User is not a member of this team' }, { status: 400 });
        }

        // Update the user's role
        const updatedUser = await User.findByIdAndUpdate(memberId, { role }, { new: true }).select('_id name email role');
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return updated team with member roles
        const updatedTeam = await Team.findById(id)
            .populate('trainer', 'name email')
            .populate('members', 'name email role');

        return NextResponse.json({ team: updatedTeam }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating member role:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update member role' },
            { status: 500 }
        );
    }
}
