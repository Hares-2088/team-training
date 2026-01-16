import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { name, email, password, role } = await request.json();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

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
            { message: 'User registered successfully', user: userWithoutPassword },
            { status: 201 }
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
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
