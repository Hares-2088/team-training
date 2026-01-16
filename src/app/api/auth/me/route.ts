import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';

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

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
