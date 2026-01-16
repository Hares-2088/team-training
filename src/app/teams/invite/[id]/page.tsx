'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader } from 'lucide-react';

export default function InviteLinkPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const teamId = params.id as string;

    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string | null>(null);
    const [showRegisterOption, setShowRegisterOption] = useState(false);

    useEffect(() => {
        // If not authenticated, redirect to register with team context
        if (!authLoading && !user) {
            router.push(`/auth/register?team=${teamId}`);
            return;
        }

        // If authenticated, show option to join or create new account
        if (user) {
            setShowRegisterOption(true);
        }
    }, [user, authLoading]);

    const joinTeam = async () => {
        if (!user) return;

        setIsJoining(true);
        setError(null);

        try {
            const response = await fetch(`/api/teams/${teamId}/join`, {
                method: 'POST',
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to join team');
            }

            const data = await response.json();
            setTeamName(data.team.name);

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to join team';
            setError(message);
            setIsJoining(false);
        }
    };

    const handleCreateNewAccount = async () => {
        setIsJoining(true);
        try {
            await logout();
            // After logout completes, redirect to register with team context
            router.push(`/auth/register?team=${teamId}`);
        } catch (err) {
            setError('Failed to log out. Please try again.');
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Invite</h1>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <Card className="card-base w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            {showRegisterOption && !isJoining && !teamName ? 'Join Team' : 'Joining Team...'}
                        </CardTitle>
                        <CardDescription>
                            {isJoining || authLoading ? 'Please wait while we set everything up' :
                                showRegisterOption && !teamName ? 'Choose how to proceed' : 'Team invite link'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        {isJoining || authLoading ? (
                            <div className="flex justify-center">
                                <Loader className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
                            </div>
                        ) : null}

                        {error && (
                            <div className="rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-4 py-3 text-sm text-danger-700 dark:text-danger-200">
                                {error}
                            </div>
                        )}

                        {showRegisterOption && !isJoining && !authLoading && !teamName && !error && (
                            <div className="space-y-4">
                                <p className="text-slate-700 dark:text-slate-300 mb-4">
                                    You're currently logged in as <strong>{user?.name}</strong>.
                                </p>
                                <div className="space-y-3">
                                    <Button onClick={joinTeam} className="w-full" variant="default">
                                        Join with Current Account
                                    </Button>
                                    <Button onClick={handleCreateNewAccount} className="w-full" variant="outline">
                                        Create New Account
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isJoining && !authLoading && !error && teamName && (
                            <div className="space-y-4">
                                <p className="text-slate-700 dark:text-slate-300">
                                    You've successfully joined <strong>{teamName}</strong>!
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        )}

                        {error && (
                            <Button onClick={() => router.push('/dashboard')} className="w-full">
                                Go to Dashboard
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
