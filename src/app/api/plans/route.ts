import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutPlan from '@/models/WorkoutPlan';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const activeTeamId = request.cookies.get('active-team')?.value || null;
        if (!activeTeamId) {
            return NextResponse.json({ error: 'Select an active team to view plans' }, { status: 400 });
        }

        const membershipQuery = {
            $or: [{ trainer: decoded.userId }, { members: decoded.userId }],
        };
        const team = await Team.findOne({ _id: activeTeamId, ...membershipQuery });
        if (!team) return NextResponse.json({ error: 'Unauthorized for active team' }, { status: 403 });

        const isTrainer = String(team.trainer) === decoded.userId;
        const memberRole = (team.memberRoles || []).find(
            (m: any) => String(m.user) === decoded.userId
        )?.role;
        const isCoach = memberRole === 'coach';

        const query: any = { team: activeTeamId };
        if (isTrainer || isCoach) {
            query.$or = [{ isPersonal: { $ne: true } }, { createdBy: decoded.userId }];
        } else {
            query.$or = [{ isPersonal: { $ne: true } }, { createdBy: decoded.userId }];
        }

        const plans = await WorkoutPlan.find(query).sort({ createdAt: -1 }).lean();

        // Attach training count to each plan
        const plansWithCount = await Promise.all(
            plans.map(async (plan) => {
                const trainingCount = await Training.countDocuments({ plan: plan._id });
                return {
                    ...plan,
                    _id: plan._id.toString(),
                    trainingCount,
                };
            })
        );

        return NextResponse.json({ plans: plansWithCount }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await request.json();

        if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
        if (!body.team) return NextResponse.json({ error: 'team is required' }, { status: 400 });

        const team = await Team.findById(body.team);
        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        const isTrainer = team.trainer.toString() === decoded.userId;
        const memberRole = (team.memberRoles || []).find(
            (m: any) => String(m.user) === decoded.userId
        )?.role;
        const isCoach = memberRole === 'coach';
        const isMember = team.members.some(
            (m: any) => String(m?._id ?? m) === decoded.userId
        );

        const isPersonal = body.isPersonal === true;

        if (isPersonal) {
            if (!isTrainer && !isCoach && !isMember) {
                return NextResponse.json({ error: 'You must be part of this team' }, { status: 403 });
            }
        } else {
            if (!isTrainer && !isCoach) {
                return NextResponse.json(
                    { error: 'Only team trainer or coach can create team plans' },
                    { status: 403 }
                );
            }
        }

        const plan = await WorkoutPlan.create({
            title: body.title,
            description: body.description,
            team: body.team,
            isPersonal,
            createdBy: decoded.userId,
        });

        return NextResponse.json({ plan }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create plan' }, { status: 500 });
    }
}
