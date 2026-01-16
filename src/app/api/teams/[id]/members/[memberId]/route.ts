import { connectDB } from '@/lib/db/mongodb';
import Team from '@/models/Team';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> | { id: string; memberId: string } }
) {
    try {
        await connectDB();
        const resolvedParams = await Promise.resolve(params);
        const { id, memberId } = resolvedParams;

        if (!id || !memberId) {
            return NextResponse.json({ error: 'Team ID and Member ID are required' }, { status: 400 });
        }

        const team = await Team.findByIdAndUpdate(
            id,
            { $pull: { members: memberId } },
            { new: true }
        )
            .populate('trainer', 'name email')
            .populate('members', 'name email');

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ team }, { status: 200 });
    } catch (error: any) {
        console.error('Error removing member:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove member' },
            { status: 500 }
        );
    }
}
