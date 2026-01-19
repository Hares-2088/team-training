import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutTemplate from '@/models/WorkoutTemplate';

export async function GET() {
    try {
        await connectDB();
        const templates = await WorkoutTemplate.find().lean();
        // Ensure _id is serialized as string
        const serialized = templates.map(template => ({
            ...template,
            _id: template._id.toString(),
        }));
        return NextResponse.json({ templates: serialized ?? [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch templates' }, { status: 500 });
    }
}
