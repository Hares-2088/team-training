import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Join via invite link - auto-adds authenticated user
export async function POST(
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
        const teamId = resolvedParams.id;

        // Find team
        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Check if user is already a member
        const alreadyMember =
            team.members.includes(decoded.userId) ||
            team.memberRoles.some((m: any) => String(m.user) === decoded.userId);

        if (alreadyMember) {
            return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
        }

        // Add user to team with role mapping
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
        console.error('Error joining team via link:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to join team' },
            { status: 500 }
        );
    }
}
