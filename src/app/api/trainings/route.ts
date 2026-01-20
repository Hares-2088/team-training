import { connectDB } from '@/lib/db/mongodb';
import Training from '@/models/Training';
import Team from '@/models/Team';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const REQUIRED_FIELDS = ['title', 'team', 'scheduledDate'] as const;

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

        const activeTeamId = request.cookies.get('active-team')?.value || null;

        // Require an active team selection to view trainings
        if (!activeTeamId) {
            return NextResponse.json({ error: 'Select an active team to view trainings' }, { status: 400 });
        }

        // Find teams the user is part of (trainer or member)
        const membershipQuery = {
            $or: [
                { trainer: decoded.userId },
                { members: decoded.userId }
            ]
        };

        const team = await Team.findOne({ _id: activeTeamId, ...membershipQuery });
        if (!team) {
            return NextResponse.json({ error: 'Unauthorized for active team' }, { status: 403 });
        }

        // Check if user is trainer/coach or member
        const isTrainer = String(team.trainer) === decoded.userId;
        const memberRole = (team.memberRoles || []).find((m: any) => String(m.user) === decoded.userId)?.role;
        const isCoach = memberRole === 'coach';

        // Trainers and coaches see only team plan trainings (not personal quick-logs)
        // Members see all trainings including their own personal ones
        const query: any = { team: activeTeamId };
        if (isTrainer || isCoach) {
            query.$and = [
                { isPersonal: { $ne: true } },
                { title: { $not: /\(Personal\)$/ } },
            ];
        }

        const trainings = await Training.find(query).sort({ scheduledDate: 1 });
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

        // Verify permissions: trainer of team OR coach and member of team
        const team = await Team.findById(body.team).populate('members', '_id');
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Enforce active team selection if present
        const activeTeamId = request.cookies.get('active-team')?.value;
        if (activeTeamId && String(activeTeamId) !== String(body.team)) {
            return NextResponse.json({ error: 'Cannot create training for non-active team' }, { status: 403 });
        }

        const isTrainer = team.trainer.toString() === decoded.userId;
        const memberRole = (team.memberRoles || []).find((m: any) => String(m.user) === decoded.userId)?.role;
        const isCoachMember = memberRole === 'coach';
        if (!isTrainer && !isCoachMember) {
            return NextResponse.json({ error: 'Unauthorized - only team trainer or coach can create trainings' }, { status: 403 });
        }

        const training = await Training.create({
            title: body.title,
            description: body.description,
            exercises: body.exercises || [],
            team: body.team,
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
