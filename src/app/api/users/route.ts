import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select('_id name email').sort({ name: 1 });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// Role updates are now driven by team membership; PATCH removed.
