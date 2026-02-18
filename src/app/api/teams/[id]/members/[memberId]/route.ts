import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const mapTeamWithMemberRoles = (teamDoc: any) => {
    const obj = teamDoc.toObject({ virtuals: true });
    const trainerId = obj.trainer?._id ? String(obj.trainer._id) : String(obj.trainer);
    const roleMap = new Map<string, string>();
    (obj.memberRoles || []).forEach((mr: any) => {
        roleMap.set(String(mr.user), mr.role);
    });

    const members = (obj.members || []).map((m: any) => {
        const id = String(m?._id || m);
        const role = id === trainerId ? 'trainer' : roleMap.get(id) || 'member';
        return { ...m, role };
    });

    return { ...obj, members };
};

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
            { $pull: { members: memberId, memberRoles: { user: memberId } } },
            { new: true }
        )
            .populate('trainer', 'name email')
            .populate('members', 'name email');

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        await User.findByIdAndUpdate(memberId, { $pull: { teams: id } });

        const shaped = mapTeamWithMemberRoles(team);

        return NextResponse.json({ team: shaped }, { status: 200 });
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

        const team = await Team.findById(id).populate('members', '_id');
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

        // Update memberRoles entry - first try to update existing role
        let updatedTeam = await Team.findOneAndUpdate(
            { _id: id, 'memberRoles.user': memberId },
            { $set: { 'memberRoles.$.role': role } },
            { new: true }
        )
            .populate('trainer', 'name email')
            .populate('members', 'name email');

        // If user doesn't have a role entry yet, create one
        if (!updatedTeam) {
            updatedTeam = await Team.findByIdAndUpdate(
                id,
                { $push: { memberRoles: { user: memberId, role: role } } },
                { new: true }
            )
                .populate('trainer', 'name email')
                .populate('members', 'name email');
        }

        if (!updatedTeam) {
            return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
        }

        const shaped = mapTeamWithMemberRoles(updatedTeam);

        return NextResponse.json({ team: shaped }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating member role:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update member role' },
            { status: 500 }
        );
    }
}
