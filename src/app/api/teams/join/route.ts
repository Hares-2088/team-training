import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

        const { inviteCode } = await request.json();

        if (!inviteCode) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
        }

        // Find team by invite code
        const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase() });

        if (!team) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        }

        // Check if user is already a member
        const alreadyMember =
            team.members.includes(decoded.userId) ||
            team.memberRoles.some((m: any) => String(m.user) === decoded.userId);

        if (alreadyMember) {
            return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
        }

        // Add user to team members with role mapping
        team.members.push(decoded.userId);
        team.memberRoles.push({ user: decoded.userId, role: 'member' });
        await team.save();

        // Track membership on the user document
        await User.findByIdAndUpdate(decoded.userId, { $addToSet: { teams: team._id } });

        return NextResponse.json(
            { message: 'Successfully joined team', team },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error joining team:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to join team' },
            { status: 500 }
        );
    }
}
