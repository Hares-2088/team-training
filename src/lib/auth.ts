import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export type UserPayload = {
    userId: string;
    email: string;
    role: string;
};

export function signToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
        return null;
    }
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    return verifyToken(token);
}
