import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutPlan from '@/models/WorkoutPlan';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { id } = await params;
        const plan = await WorkoutPlan.findById(id).lean();
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        // Verify team membership
        const team = await Team.findOne({
            _id: plan.team,
            $or: [{ trainer: decoded.userId }, { members: decoded.userId }],
        });
        if (!team) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const trainings = await Training.find({ plan: id }).sort({ scheduledDate: 1 }).lean();

        return NextResponse.json({
            plan: { ...plan, _id: plan._id.toString() },
            trainings: trainings.map((t) => ({ ...t, _id: t._id.toString() })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch plan' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { id } = await params;
        const plan = await WorkoutPlan.findById(id);
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        const team = await Team.findById(plan.team);
        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        const isTrainer = team.trainer.toString() === decoded.userId;
        const memberRole = (team.memberRoles || []).find(
            (m: any) => String(m.user) === decoded.userId
        )?.role;
        const isCoach = memberRole === 'coach';
        const isOwner = plan.createdBy && String(plan.createdBy) === decoded.userId;

        if (!isTrainer && !isCoach && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized to edit this plan' }, { status: 403 });
        }

        const body = await request.json();
        if (body.title !== undefined) plan.title = body.title;
        if (body.description !== undefined) plan.description = body.description;
        await plan.save();

        return NextResponse.json({ plan });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { id } = await params;
        const plan = await WorkoutPlan.findById(id);
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        const team = await Team.findById(plan.team);
        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        const isTrainer = team.trainer.toString() === decoded.userId;
        const memberRole = (team.memberRoles || []).find(
            (m: any) => String(m.user) === decoded.userId
        )?.role;
        const isCoach = memberRole === 'coach';
        const isOwner = plan.createdBy && String(plan.createdBy) === decoded.userId;

        if (!isTrainer && !isCoach && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized to delete this plan' }, { status: 403 });
        }

        // Delete all trainings in the plan, then the plan itself
        await Training.deleteMany({ plan: id });
        await WorkoutPlan.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Plan deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete plan' }, { status: 500 });
    }
}
