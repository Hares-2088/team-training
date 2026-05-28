import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutTemplate from '@/models/WorkoutTemplate';
import Training from '@/models/Training';
import Team from '@/models/Team';
import WorkoutPlan from '@/models/WorkoutPlan';
import { verifyToken } from '@/lib/auth';
import { getMemberRole } from '@/lib/utils/helpers';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { planId } = body;

        if (!planId) {
            return NextResponse.json({ error: 'planId is required' }, { status: 400 });
        }

        // Get the template
        const template = await WorkoutTemplate.findById(id).lean();
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const plan = await WorkoutPlan.findById(planId);
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const team = await Team.findById(plan.team);
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const isTrainer = String(team.trainer) === decoded.userId;
        const memberRole = getMemberRole(team, decoded.userId);
        const isCoach = memberRole === 'coach';
        const isMember = team.members.some((m: any) => String(m?._id ?? m) === decoded.userId);
        const isOwner = plan.createdBy && String(plan.createdBy) === decoded.userId;

        if (plan.isPersonal) {
            if (!isTrainer && !isCoach && !isOwner) {
                return NextResponse.json({ error: 'Unauthorized to add workouts to this plan' }, { status: 403 });
            }
        } else {
            if (!isTrainer && !isCoach) {
                return NextResponse.json(
                    { error: 'Only team trainer or coach can add workouts to team plans' },
                    { status: 403 }
                );
            }
        }

        if (!isTrainer && !isCoach && !isMember) {
            return NextResponse.json({ error: 'Unauthorized for this plan team' }, { status: 403 });
        }

        // Add workout to plan from the template
        const training = await Training.create({
            title: template.title,
            description: template.description || '',
            exercises: template.exercises.map((ex: any) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                restTime: ex.restTime ?? 90,
                notes: ex.notes || '',
            })),
            team: plan.team,
            scheduledDate: new Date(),
            status: 'scheduled',
            isPersonal: plan.isPersonal === true,
            createdBy: plan.isPersonal ? plan.createdBy : undefined,
            plan: plan._id,
        });

        return NextResponse.json({ trainingId: training._id.toString(), planId: plan._id.toString() }, { status: 201 });
    } catch (error: any) {
        console.error('Error adding template to plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to add template to plan' }, { status: 500 });
    }
}
