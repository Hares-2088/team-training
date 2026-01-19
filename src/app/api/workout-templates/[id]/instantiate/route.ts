import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutTemplate from '@/models/WorkoutTemplate';
import Training from '@/models/Training';
import Team from '@/models/Team';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { id } = await params;

        // Only members and coaches can instantiate for quick logging
        if (decoded.role === 'trainer') {
            return NextResponse.json({ error: 'Trainers should add templates to team plan instead.' }, { status: 403 });
        }

        // Find user's team
        const teams = await Team.find({ members: decoded.userId });
        if (!teams || teams.length === 0) {
            return NextResponse.json({ error: 'No team found for user' }, { status: 400 });
        }
        const userTeam = teams[0];

        // Get template
        const template = await WorkoutTemplate.findById(id).lean();
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Create a training instance for logging
        const training = await Training.create({
            title: `${template.title} (Personal)`,
            description: template.description || 'Personal workout from library template',
            exercises: template.exercises.map((ex: any) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                restTime: ex.restTime ?? 90,
                notes: ex.notes || '',
            })),
            team: userTeam._id,
            scheduledDate: new Date(),
            status: 'scheduled',
        });

        return NextResponse.json({ trainingId: training._id.toString() }, { status: 201 });
    } catch (error: any) {
        console.error('Instantiate template error:', error);
        return NextResponse.json({ error: error.message || 'Failed to instantiate template' }, { status: 500 });
    }
}
