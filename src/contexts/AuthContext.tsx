'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    _id: string;
    name: string;
    email: string;
    role?: 'trainer' | 'member' | 'coach';
    teams?: string[];
};

type ActiveTeam = {
    teamId: string | null;
    role: 'trainer' | 'member' | 'coach' | null;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: 'trainer' | 'member' | 'coach', teamId?: string) => Promise<void>;
    logout: () => Promise<void>;
    activeTeam: ActiveTeam;
    setActiveTeam: (teamId: string, role?: 'trainer' | 'member' | 'coach') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTeam, setActiveTeamState] = useState<ActiveTeam>({ teamId: null, role: null });
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            }
            const activeRes = await fetch('/api/auth/active-team', {
                method: 'GET',
                credentials: 'include',
            });
            if (activeRes.ok) {
                const data = await activeRes.json();
                setActiveTeamState({ teamId: data.teamId ?? null, role: data.role ?? null });
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }

        const data = await res.json();
        setUser(data.user);

        // Fetch teams to decide selection or auto-assign
        const teamsRes = await fetch('/api/teams', { credentials: 'include' });
        if (teamsRes.ok) {
            const teams = await teamsRes.json();
            if (teams.length === 1) {
                const only = teams[0];
                const membership = only.members?.find((m: any) => m._id === data.user._id) || {};
                const role = only.trainer?._id === data.user._id ? 'trainer' : membership.role || 'member';
                await setActiveTeam(only._id, role);
                router.push('/dashboard');
                return;
            }
            router.push('/teams/select');
            return;
        }

        router.push('/teams/select');
    }, [router]);

    const register = useCallback(async (name: string, email: string, password: string, role: 'trainer' | 'member' | 'coach', teamId?: string) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Registration failed');
        }

        const data = await res.json();
        setUser(data.user);

        if (data.user.createdTeamId) {
            await setActiveTeam(data.user.createdTeamId, 'trainer');
            router.push('/dashboard');
            return;
        }

        // If registering from team invite, redirect back to invite page
        if (teamId) {
            router.push(`/teams/invite/${teamId}`);
        } else {
            router.push('/teams/select');
        }
    }, [router]);

    const logout = useCallback(async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
        setActiveTeamState({ teamId: null, role: null });
        router.push('/auth/login');
    }, [router]);

    const setActiveTeam = useCallback(async (teamId: string, role?: 'trainer' | 'member' | 'coach') => {
        const res = await fetch('/api/auth/active-team', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to set active team');
        }
        const data = await res.json();
        setActiveTeamState({ teamId: data.teamId, role: data.role || role || null });
    }, []);

    const value = useMemo(() => ({ user, loading, login, register, logout, activeTeam, setActiveTeam }), [user, loading, login, register, logout, activeTeam, setActiveTeam]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
