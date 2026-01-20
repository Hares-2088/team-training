import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth';
import Team from '@/models/Team';

function activeTeamResponse(teamId: string | null, role: string | null) {
    return NextResponse.json({ teamId, role }, { status: 200 });
}

export async function GET(request: NextRequest) {
    const teamId = request.cookies.get('active-team')?.value || null;
    const role = request.cookies.get('active-team-role')?.value || null;
    return activeTeamResponse(teamId, role);
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { teamId } = await request.json();
        if (!teamId) {
            return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
        }

        const team = await Team.findById(teamId).select('trainer members memberRoles');
        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const userId = decoded.userId;
        const isTrainer = String(team.trainer) === userId;
        const memberRole = (team.memberRoles || []).find((m: any) => String(m.user) === userId)?.role;
        const isMember = team.members.some((m: any) => String(m?._id ?? m) === userId);

        if (!isTrainer && !isMember && !memberRole) {
            return NextResponse.json({ error: 'Unauthorized for this team' }, { status: 403 });
        }

        const role = isTrainer ? 'trainer' : (memberRole || 'member');

        const response = activeTeamResponse(teamId, role);
        response.cookies.set('active-team', teamId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        response.cookies.set('active-team-role', role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error: any) {
        console.error('Error setting active team:', error);
        return NextResponse.json({ error: error.message || 'Failed to set active team' }, { status: 500 });
    }
}
