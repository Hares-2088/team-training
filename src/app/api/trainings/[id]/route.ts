import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import { toDateAtLocalMidnight } from '@/lib/date';
import { canViewResource, getTeamAccess, stringifyId, toSerializable } from '@/lib/trainings/access';
import { trainingUpdateSchema } from '@/lib/validation/training';
import Training from '@/models/Training';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json({ error: 'Training ID is required' }, { status: 400 });
    }

    const training = await Training.findById(id)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('plan', 'title generationSource goalSummary')
      .lean();

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const access = await getTeamAccess(stringifyId(training.team), decoded.userId);
    if (!access || !canViewResource(training, decoded.userId, access.canManage, 'assignedTo')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ training: toSerializable(training) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch training';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const training = await Training.findById(id);
    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const access = await getTeamAccess(stringifyId(training.team), decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isOwner = stringifyId(training.createdBy) === decoded.userId;
    if (!access.canManage && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const parseResult = trainingUpdateSchema.safeParse(await request.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid training payload' },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    if (body.assignedTo && body.assignedTo !== access.team.trainer && !access.team.members.includes(body.assignedTo)) {
      return NextResponse.json({ error: 'Assigned user must belong to the selected team' }, { status: 400 });
    }

    if (body.title !== undefined) training.title = body.title;
    if (body.description !== undefined) training.description = body.description;
    if (body.exercises !== undefined) training.exercises = body.exercises;
    if (body.status !== undefined) training.status = body.status;
    if (body.isPersonal !== undefined) training.isPersonal = body.isPersonal;
    if (body.assignedTo !== undefined) training.assignedTo = body.assignedTo || undefined;
    if (body.warmup !== undefined) training.warmup = body.warmup;
    if (body.dayFocus !== undefined) training.dayFocus = body.dayFocus;
    if (body.cardioBlock !== undefined) training.cardioBlock = body.cardioBlock;
    if (body.intensityNotes !== undefined) training.intensityNotes = body.intensityNotes;
    if (body.instructions !== undefined) training.instructions = body.instructions;
    if (body.planId !== undefined) training.plan = body.planId || undefined;
    if (body.scheduledDate !== undefined) {
      const scheduledDate = toDateAtLocalMidnight(body.scheduledDate);
      if (Number.isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ error: 'Invalid scheduledDate' }, { status: 400 });
      }
      training.scheduledDate = scheduledDate;
    }

    await training.save();
    return NextResponse.json({ training: toSerializable(training.toObject()) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update training';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const training = await Training.findById(id);
    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 });
    }

    const access = await getTeamAccess(stringifyId(training.team), decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isOwner = stringifyId(training.createdBy) === decoded.userId;
    if (!access.canManage && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Training.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Training deleted' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete training';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
