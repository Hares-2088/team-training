import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import WorkoutTemplate from '@/models/WorkoutTemplate';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log('Fetching template with ID:', id);
        await connectDB();

        // Debug: count all templates
        const count = await WorkoutTemplate.countDocuments();
        console.log('Total templates in DB:', count);

        const template = await WorkoutTemplate.findById(id).lean();
        console.log('Query result:', template);

        if (!template) {
            // Try finding with regex to debug
            const allIds = await WorkoutTemplate.find().select('_id').lean();
            console.log('All template IDs:', allIds.map(t => t._id.toString()));
            console.log('Template not found in DB');
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        // Ensure _id is serialized as string
        const serialized = {
            ...template,
            _id: template._id.toString(),
        };
        return NextResponse.json({ template: serialized });
    } catch (error: any) {
        console.error('Error fetching template:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch template' }, { status: 500 });
    }
}
