import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

        // Filter teams based on user role
        // Trainers see teams they created
        // Members see their team
        const teams = await Team.find({
            $or: [
                { trainer: decoded.userId },
                { members: decoded.userId }
            ]
        }).select('_id name').sort({ name: 1 });

        return NextResponse.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

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

        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
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

        const team = await Team.create({
            name,
            description: description || '',
            trainer: decoded.userId,
            inviteCode,
        });

        await team.populate('trainer', 'name email');

        return NextResponse.json({ team }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating team:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create team' },
            { status: 500 }
        );
    }
}
