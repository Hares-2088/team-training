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

        // All users (members, coaches, trainers) can instantiate for quick logging
        // Use active team if available, otherwise find user's first team
        const activeTeamId = request.cookies.get('active-team')?.value;
        let userTeam;

        if (activeTeamId) {
            // For trainers, find the active team they're training
            // For members/coaches, find the active team they're in
            const membershipQuery = decoded.role === 'trainer'
                ? { _id: activeTeamId, trainer: decoded.userId }
                : { _id: activeTeamId, members: decoded.userId };

            userTeam = await Team.findOne(membershipQuery);
            if (!userTeam) {
                return NextResponse.json({ error: 'Active team not found or unauthorized' }, { status: 403 });
            }
        } else {
            // Find first team where user belongs
            const membershipQuery = decoded.role === 'trainer'
                ? { trainer: decoded.userId }
                : { members: decoded.userId };

            const teams = await Team.find(membershipQuery);
            if (!teams || teams.length === 0) {
                return NextResponse.json({ error: 'No team found for user' }, { status: 400 });
            }
            userTeam = teams[0];
        }

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
            isPersonal: true,
            createdBy: decoded.userId,
        });

        return NextResponse.json({ trainingId: training._id.toString() }, { status: 201 });
    } catch (error: any) {
        console.error('Instantiate template error:', error);
        return NextResponse.json({ error: error.message || 'Failed to instantiate template' }, { status: 500 });
    }
}
