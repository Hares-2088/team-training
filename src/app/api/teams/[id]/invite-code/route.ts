import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

        // Find team and verify user is trainer
        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Only the trainer can generate invite codes' }, { status: 403 });
        }

        // Generate a unique invite code
        const generateInviteCode = () => {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        };

        let inviteCode = generateInviteCode();
        let codeExists = await Team.findOne({ inviteCode });

        while (codeExists) {
            inviteCode = generateInviteCode();
            codeExists = await Team.findOne({ inviteCode });
        }

        // Update team with new invite code
        team.inviteCode = inviteCode;
        await team.save();

        return NextResponse.json({ inviteCode }, { status: 200 });
    } catch (error: any) {
        console.error('Error generating invite code:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate invite code' },
            { status: 500 }
        );
    }
}
