import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import Training from '@/models/Training';
import { buildVisibilityQuery, getTeamAccess, stringifyId, toSerializable } from '@/lib/trainings/access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;
    const teamId = request.cookies.get('active-team')?.value || new URL(request.url).searchParams.get('teamId');
    if (!teamId) {
      return NextResponse.json({ error: 'Select an active team to view user trainings' }, { status: 400 });
    }

    const access = await getTeamAccess(teamId, decoded.userId);
    if (!access) {
      return NextResponse.json({ error: 'Unauthorized for team' }, { status: 403 });
    }

    const isSelf = userId === decoded.userId;
    if (!isSelf && !access.canManage) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const query = isSelf && !access.canManage
      ? buildVisibilityQuery(teamId, decoded.userId, false, 'assignedTo')
      : {
          team: teamId,
          $or: [{ assignedTo: userId }, { createdBy: userId }],
        };

    const trainings = await Training.find(query)
      .populate('team', 'name')
      .populate('assignedTo', 'name email')
      .populate('plan', 'title generationSource goalSummary')
      .sort({ scheduledDate: 1 })
      .lean();

    return NextResponse.json({ trainings: toSerializable(trainings) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user trainings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
