import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Team from '@/models/Team';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

async function resolvePrimaryRole(userId: string): Promise<'trainer' | 'member' | 'coach'> {
    const team = await Team.findOne({
        $or: [{ trainer: userId }, { 'memberRoles.user': userId }],
    }).select('trainer memberRoles');

    if (!team) return 'member';
    if (String(team.trainer) === String(userId)) return 'trainer';

    const membership = team.memberRoles.find((m: any) => String(m.user) === String(userId));

    return (membership?.role as 'trainer' | 'member' | 'coach') || 'member';
}

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
        const primaryRole = await resolvePrimaryRole(user._id.toString());

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: primaryRole,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        const responseUser = { ...userWithoutPassword, role: primaryRole };

        // Set token in cookie
        const response = NextResponse.json(
            { message: 'Login successful', user: responseUser },
            { status: 200 }
        );

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
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
