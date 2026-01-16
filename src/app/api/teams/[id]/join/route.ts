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
        if (team.members.includes(decoded.userId)) {
            return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
        }

        // Add user to team
        team.members.push(decoded.userId);
        await team.save();

        // Update user role to member if not already
        await User.findByIdAndUpdate(decoded.userId, { role: 'member' });

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
