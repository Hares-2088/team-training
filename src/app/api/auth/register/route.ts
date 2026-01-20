import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import Team from '@/models/Team';
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
            teams: [],
        });

        let createdTeamId: string | null = null;

        if (role === 'trainer') {
            const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
            let inviteCode = generateInviteCode();
            let codeExists = await Team.findOne({ inviteCode });

            while (codeExists) {
                inviteCode = generateInviteCode();
                codeExists = await Team.findOne({ inviteCode });
            }

            const team = await Team.create({
                name: `${name}'s Team`,
                description: '',
                trainer: user._id,
                inviteCode,
                members: [user._id],
                memberRoles: [{ user: user._id, role: 'trainer' }],
            });

            createdTeamId = team._id.toString();
            user.teams.push(team._id);
            await user.save();
        }

        const primaryRole = role === 'trainer' ? 'trainer' : 'member';

        // Generate JWT token
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: primaryRole,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toObject();
        const responseUser = {
            ...userWithoutPassword,
            role: primaryRole,
            teams: user.teams,
            createdTeamId,
        };

        // Set token in cookie
        const response = NextResponse.json(
            { message: 'User registered successfully', user: responseUser },
            { status: 201 }
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
            { error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
