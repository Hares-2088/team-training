import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import WorkoutPlan from '@/models/WorkoutPlan';
import Training from '@/models/Training';
import { buildVisibilityQuery, getTeamAccess, stringifyId, toSerializable } from '@/lib/trainings/access';
import { workoutPlanCreateSchema } from '@/lib/validation/training';

function normalizePlanPayload(body: ReturnType<typeof workoutPlanCreateSchema.parse>) {
  if (!body.aiMetadata) {
    return undefined;
  }

  return {
    ...body.aiMetadata,
    generatedAt: body.aiMetadata.generatedAt ? new Date(body.aiMetadata.generatedAt) : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const activeTeamId = request.cookies.get('active-team')?.value;
    if (!activeTeamId) {
      return NextResponse.json({ error: 'Select an active team to view plans' }, { status: 400 });
    }

    const access = await getTeamAccess(activeTeamId, decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized for active team' }, { status: 403 });
    }

    const plans = await WorkoutPlan.find(buildVisibilityQuery(activeTeamId, decoded.userId, access.canManage, 'assignee'))
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const planIds = plans.map((plan) => plan._id);
    const counts = await Training.aggregate<{ _id: string; total: number }>([
      { $match: { plan: { $in: planIds } } },
      { $group: { _id: '$plan', total: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [stringifyId(item._id), item.total]));

    const serializedPlans = toSerializable(
      plans.map((plan) => ({
        ...plan,
        workoutCount: countMap.get(stringifyId(plan._id)) || 0,
      }))
    );

    return NextResponse.json({ plans: serializedPlans }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch plans';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const parseResult = workoutPlanCreateSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid plan payload' },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    const access = await getTeamAccess(body.team, decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized for team' }, { status: 403 });
    }

    const assigneeId = body.assignee || undefined;
    if (assigneeId && assigneeId !== access.team.trainer && !access.team.members.includes(assigneeId)) {
      return NextResponse.json({ error: 'Assignee must belong to the selected team' }, { status: 400 });
    }

    if (body.isPersonal) {
      if (!access.canManage && assigneeId && assigneeId !== decoded.userId) {
        return NextResponse.json({ error: 'You can only create personal plans for yourself' }, { status: 403 });
      }
    } else if (!access.canManage) {
      return NextResponse.json(
        { error: 'Only team trainer or coach can create team plans' },
        { status: 403 }
      );
    }

    const plan = await WorkoutPlan.create({
      title: body.title,
      description: body.description,
      team: body.team,
      isPersonal: body.isPersonal,
      createdBy: decoded.userId,
      assignee: assigneeId,
      goalSummary: body.goalSummary,
      weeklyStructure: body.weeklyStructure,
      progressionNotes: body.progressionNotes,
      cardioSummary: body.cardioSummary,
      safetyNotes: body.safetyNotes,
      generationSource: body.generationSource,
      aiMetadata: normalizePlanPayload(body),
    });

    return NextResponse.json({ plan: toSerializable(plan.toObject()) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
