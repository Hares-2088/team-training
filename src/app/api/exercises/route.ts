import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Exercise from '@/models/Exercise';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const teamId = searchParams.get('teamId');

        if (!teamId) {
            return NextResponse.json(
                { error: 'Team ID is required' },
                { status: 400 }
            );
        }

        let query: any = { teamId };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const exercises = await Exercise.find(query)
            .select('name muscleGroups equipment teamId')
            .sort({ name: 1 })
            .limit(100);

        return NextResponse.json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return NextResponse.json(
            { error: 'Failed to fetch exercises' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();

        const body = await request.json();
        const { name, teamId, muscleGroups, equipment } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Exercise name is required' },
                { status: 400 }
            );
        }

        if (!teamId) {
            return NextResponse.json(
                { error: 'Team ID is required' },
                { status: 400 }
            );
        }

        // Check if exercise already exists for this team (case-insensitive)
        const existingExercise = await Exercise.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            teamId
        });

        if (existingExercise) {
            return NextResponse.json(existingExercise);
        }

        // Create new exercise for this team
        const exercise = await Exercise.create({
            name: name.trim(),
            teamId,
            muscleGroups: muscleGroups || [],
            equipment: equipment || '',
        });

        return NextResponse.json(exercise, { status: 201 });
    } catch (error) {
        console.error('Error creating exercise:', error);
        return NextResponse.json(
            { error: 'Failed to create exercise' },
            { status: 500 }
        );
    }
}
