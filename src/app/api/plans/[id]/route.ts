import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import WorkoutPlan from '@/models/WorkoutPlan';
import Training from '@/models/Training';
import { canViewResource, getTeamAccess, stringifyId, toSerializable } from '@/lib/trainings/access';
import { workoutPlanUpdateSchema } from '@/lib/validation/training';

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
    const plan = await WorkoutPlan.findById(id).populate('assignee', 'name email').lean();
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const access = await getTeamAccess(stringifyId(plan.team), decoded.userId);
    if (!access || !canViewResource(plan, decoded.userId, access.canManage, 'assignee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const trainingQuery = access.canManage
      ? { plan: id }
      : {
          plan: id,
          $or: [
            { createdBy: decoded.userId },
            { assignedTo: decoded.userId },
            { isPersonal: { $ne: true }, assignedTo: null },
            { isPersonal: { $ne: true }, assignedTo: { $exists: false } },
          ],
        };

    const trainings = await Training.find(trainingQuery)
      .populate('assignedTo', 'name email')
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json(
      {
        plan: toSerializable(plan),
        trainings: toSerializable(trainings),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch plan';
    return NextResponse.json({ error: message }, { status: 500 });
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

    const access = await getTeamAccess(stringifyId(plan.team), decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isOwner = stringifyId(plan.createdBy) === decoded.userId;
    if (!access.canManage && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized to edit this plan' }, { status: 403 });
    }

    const parseResult = workoutPlanUpdateSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid plan payload' },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    if (body.assignee && body.assignee !== access.team.trainer && !access.team.members.includes(body.assignee)) {
      return NextResponse.json({ error: 'Assignee must belong to the selected team' }, { status: 400 });
    }

    if (body.title !== undefined) plan.title = body.title;
    if (body.description !== undefined) plan.description = body.description;
    if (body.isPersonal !== undefined) plan.isPersonal = body.isPersonal;
    if (body.assignee !== undefined) {
      plan.assignee = body.assignee ? new Types.ObjectId(body.assignee) : undefined;
    }
    if (body.goalSummary !== undefined) plan.goalSummary = body.goalSummary;
    if (body.weeklyStructure !== undefined) plan.weeklyStructure = body.weeklyStructure;
    if (body.progressionNotes !== undefined) plan.progressionNotes = body.progressionNotes;
    if (body.cardioSummary !== undefined) plan.cardioSummary = body.cardioSummary;
    if (body.safetyNotes !== undefined) plan.safetyNotes = body.safetyNotes;
    if (body.generationSource !== undefined) plan.generationSource = body.generationSource;
    if (body.aiMetadata !== undefined) {
      plan.aiMetadata = body.aiMetadata
        ? {
            ...body.aiMetadata,
            requestId: body.aiMetadata.requestId
              ? new Types.ObjectId(body.aiMetadata.requestId)
              : undefined,
            generatedAt: body.aiMetadata.generatedAt
              ? new Date(body.aiMetadata.generatedAt)
              : undefined,
          }
        : undefined;
    }

    await plan.save();
    return NextResponse.json({ plan: toSerializable(plan.toObject()) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update plan';
    return NextResponse.json({ error: message }, { status: 500 });
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

    const access = await getTeamAccess(stringifyId(plan.team), decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isOwner = stringifyId(plan.createdBy) === decoded.userId;
    if (!access.canManage && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized to delete this plan' }, { status: 403 });
    }

    await Training.deleteMany({ plan: id });
    await WorkoutPlan.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Plan deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
