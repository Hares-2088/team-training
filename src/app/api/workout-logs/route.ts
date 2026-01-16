import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutLog from '@/models/WorkoutLog';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get user from JWT token
        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workoutLogs = await WorkoutLog.find({ member: currentUser.userId })
            .populate('training', 'title scheduledDate')
            .populate('member', 'name')
            .sort({ completedAt: -1 });

        return NextResponse.json(workoutLogs);
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
    }
}
