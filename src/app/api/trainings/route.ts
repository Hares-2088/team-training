import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import { toDateAtLocalMidnight } from '@/lib/date';
import { buildVisibilityQuery, getTeamAccess, stringifyId, toSerializable } from '@/lib/trainings/access';
import { trainingCreateSchema } from '@/lib/validation/training';
import Training from '@/models/Training';
import WorkoutPlan from '@/models/WorkoutPlan';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const activeTeamId = request.cookies.get('active-team')?.value;
    if (!activeTeamId) {
      return NextResponse.json({ error: 'Select an active team to view trainings' }, { status: 400 });
    }

    const access = await getTeamAccess(activeTeamId, decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized for active team' }, { status: 403 });
    }

    const trainings = await Training.find(
      buildVisibilityQuery(activeTeamId, decoded.userId, access.canManage, 'assignedTo')
    )
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('plan', 'title generationSource goalSummary')
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ trainings: toSerializable(trainings) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trainings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const parseResult = trainingCreateSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid training payload' },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    const access = await getTeamAccess(body.team, decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized for team' }, { status: 403 });
    }

    const assignedTo = body.assignedTo || undefined;
    if (assignedTo && assignedTo !== access.team.trainer && !access.team.members.includes(assignedTo)) {
      return NextResponse.json({ error: 'Assigned user must belong to the selected team' }, { status: 400 });
    }

    if (body.isPersonal) {
      if (!access.canManage && assignedTo && assignedTo !== decoded.userId) {
        return NextResponse.json({ error: 'You can only create personal trainings for yourself' }, { status: 403 });
      }
    } else if (!access.canManage) {
      return NextResponse.json(
        { error: 'Only team trainer or coach can create team trainings' },
        { status: 403 }
      );
    }

    if (body.planId) {
      const plan = await WorkoutPlan.findById(body.planId).select('team assignee');
      if (!plan || stringifyId(plan.team) !== body.team) {
        return NextResponse.json({ error: 'Plan not found for selected team' }, { status: 404 });
      }
      if (!assignedTo && stringifyId(plan.assignee)) {
        body.assignedTo = stringifyId(plan.assignee);
      }
    }

    const scheduledDate = toDateAtLocalMidnight(body.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledDate' }, { status: 400 });
    }

    const training = await Training.create({
      title: body.title,
      description: body.description,
      exercises: body.exercises,
      team: body.team,
      scheduledDate,
      status: body.status,
      isPersonal: body.isPersonal,
      createdBy: decoded.userId,
      assignedTo: body.assignedTo || undefined,
      plan: body.planId || undefined,
      warmup: body.warmup,
      dayFocus: body.dayFocus,
      cardioBlock: body.cardioBlock,
      intensityNotes: body.intensityNotes,
      instructions: body.instructions,
    });

    return NextResponse.json({ training: toSerializable(training.toObject()) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create training';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
