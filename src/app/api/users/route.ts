import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyToken, signToken } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select('_id name email role').sort({ name: 1 });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        // Get user from token
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { role } = await request.json();

        if (!role || !['trainer', 'member'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Update user role
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate new JWT token with updated role
        const newToken = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set new token in cookie
        const response = NextResponse.json({ user }, { status: 200 });
        response.cookies.set('auth-token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update user' },
            { status: 500 }
        );
    }
}
