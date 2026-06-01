import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import UserProgressImage from '@/models/UserProgressImage';
import { getTeamAccess, toSerializable } from '@/lib/trainings/access';
import { progressImageUploadSchema } from '@/lib/validation/training';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
      return NextResponse.json({ error: 'Select an active team to view progress images' }, { status: 400 });
    }

    const access = await getTeamAccess(teamId, decoded.userId);
    if (!access || (userId !== decoded.userId && !access.canManage)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const images = await UserProgressImage.find({ owner: userId, team: teamId })
      .select('-imageData')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ images: toSerializable(images) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch progress images';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
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
    const formData = await request.formData();
    const rawTeamId = formData.get('teamId');
    const rawNote = formData.get('note');
    const rawCapturedAt = formData.get('capturedAt');
    const rawGenerationRequestId = formData.get('generationRequestId');
    const parseResult = progressImageUploadSchema.safeParse({
      teamId: typeof rawTeamId === 'string' ? rawTeamId : '',
      note: typeof rawNote === 'string' ? rawNote : undefined,
      capturedAt: typeof rawCapturedAt === 'string' && rawCapturedAt ? rawCapturedAt : undefined,
      generationRequestId:
        typeof rawGenerationRequestId === 'string' && rawGenerationRequestId
          ? rawGenerationRequestId
          : undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid image payload' },
        { status: 400 }
      );
    }

    const access = await getTeamAccess(parseResult.data.teamId, decoded.userId);
    if (!access || (userId !== decoded.userId && !access.canManage)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WEBP images are allowed' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    const image = await UserProgressImage.create({
      owner: userId,
      uploadedBy: decoded.userId,
      team: parseResult.data.teamId,
      generationRequest: parseResult.data.generationRequestId,
      fileName: file.name || `progress-${Date.now()}`,
      mimeType: file.type,
      sizeBytes: file.size,
      note: parseResult.data.note,
      capturedAt: parseResult.data.capturedAt ? new Date(parseResult.data.capturedAt) : undefined,
      imageData: Buffer.from(await file.arrayBuffer()),
    });

    const serializedImage = await UserProgressImage.findById(image._id).select('-imageData').lean();
    return NextResponse.json({ image: toSerializable(serializedImage) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload progress image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
