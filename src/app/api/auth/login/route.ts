import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await request.json();

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();

        // Set token in cookie
        const response = NextResponse.json(
            { message: 'Login successful', user: userWithoutPassword },
            { status: 200 }
        );

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
