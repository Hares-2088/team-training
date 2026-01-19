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
        const body = await request.json();
        const { teamId } = body;

        // Get the template
        const template = await WorkoutTemplate.findById(id).lean();
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        let selectedTeamId = teamId;

        // If trainer, teamId must be provided and user must be trainer of that team
        if (decoded.role === 'trainer') {
            if (!selectedTeamId) {
                return NextResponse.json({ error: 'Team ID required for trainers' }, { status: 400 });
            }
            const team = await Team.findById(selectedTeamId);
            if (!team || team.trainer.toString() !== decoded.userId) {
                return NextResponse.json({ error: 'Not trainer of this team' }, { status: 403 });
            }
        }

        // If coach or member, use their team
        if (decoded.role === 'coach' || decoded.role === 'member') {
            const userTeams = await Team.find({ members: decoded.userId });
            if (!userTeams || userTeams.length === 0) {
                return NextResponse.json({ error: 'No team found for user' }, { status: 400 });
            }
            selectedTeamId = userTeams[0]._id;
        }

        // Create a training from the template
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
            team: selectedTeamId,
            trainer: decoded.userId,
            scheduledDate: new Date(),
            status: 'scheduled',
        });

        return NextResponse.json({ trainingId: training._id.toString() }, { status: 201 });
    } catch (error: any) {
        console.error('Error adding template to plan:', error);
        return NextResponse.json({ error: error.message || 'Failed to add template to plan' }, { status: 500 });
    }
}
