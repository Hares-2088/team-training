import { connectDB } from '@/lib/db/mongodb';
import { createWorkoutLogResponse, getWorkoutLogsResponse } from '@/lib/server/workout-logs';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> | { workoutId: string } }
) {
  await connectDB();
  const resolvedParams = await Promise.resolve(params);
  return createWorkoutLogResponse(request, resolvedParams.workoutId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> | { workoutId: string } }
) {
  await connectDB();
  const resolvedParams = await Promise.resolve(params);
  return getWorkoutLogsResponse(request, resolvedParams.workoutId);
}
