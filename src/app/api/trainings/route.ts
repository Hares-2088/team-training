import { connectDB } from '@/lib/db/mongodb';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const REQUIRED_FIELDS = ['title', 'team', 'trainer', 'scheduledDate'] as const;

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

        // Find teams the user is part of (trainer or member)
        const userTeams = await Team.find({
            $or: [
                { trainer: decoded.userId },
                { members: decoded.userId }
            ]
        });

        const teamIds = userTeams.map((team) => team._id);

        // Get trainings for those teams
        const trainings = await Training.find({
            team: { $in: teamIds }
        }).sort({ scheduledDate: 1 });

        return NextResponse.json({ trainings }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch trainings' },
            { status: 500 }
        );
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

        const body = await request.json();

        // Basic validation
        for (const field of REQUIRED_FIELDS) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Verify user is the trainer of the team
        const team = await Team.findById(body.team);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (team.trainer.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized - only team trainer can create trainings' }, { status: 403 });
        }

        const training = await Training.create({
            title: body.title,
            description: body.description,
            exercises: body.exercises || [],
            team: body.team,
            trainer: decoded.userId,
            scheduledDate: new Date(body.scheduledDate),
            status: body.status || 'scheduled',
        });

        return NextResponse.json({ training }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create training' },
            { status: 500 }
        );
    }
}
