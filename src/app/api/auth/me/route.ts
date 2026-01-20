import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Team from '@/models/Team';

async function resolvePrimaryRole(userId: string): Promise<'trainer' | 'member' | 'coach'> {
    const team = await Team.findOne({
        $or: [{ trainer: userId }, { 'memberRoles.user': userId }],
    }).select('trainer memberRoles');

    if (!team) return 'member';
    if (String(team.trainer) === String(userId)) return 'trainer';

    const membership = team.memberRoles.find((m: any) => String(m.user) === String(userId));

    return (membership?.role as 'trainer' | 'member' | 'coach') || 'member';
}

export async function GET(request: NextRequest) {
    const payload = getUserFromRequest(request);

    if (!payload) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
        await connectDB();
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const primaryRole = await resolvePrimaryRole(payload.userId);
        const responseUser = { ...user.toObject(), role: primaryRole };

        return NextResponse.json({ user: responseUser }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
