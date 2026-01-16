'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RoleSelectPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [isJoiningTeam, setIsJoiningTeam] = useState(false);

    // Redirect if not authenticated
    if (!user) {
        router.push('/auth/login');
        return null;
    }

    const handleTrainerSelect = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Update user role to trainer
            const roleResponse = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'trainer' }),
            });

            if (!roleResponse.ok) {
                const payload = await roleResponse.json();
                throw new Error(payload.error || 'Failed to update role');
            }

            // Create a new team for the trainer
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${user.name}'s Team`,
                    description: 'My fitness training team',
                }),
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to create team');
            }

            // Force reload to pick up new JWT token with trainer role
            window.location.href = '/dashboard';
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create team';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMemberSelect = () => {
        setShowInviteModal(true);
    };

    const handleJoinTeam = async () => {
        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }

        setIsJoiningTeam(true);
        setError(null);

        try {
            const response = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: inviteCode.trim() }),
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to join team');
            }

            router.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to join team';
            setError(message);
        } finally {
            setIsJoiningTeam(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user.name}!</h1>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Role</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Are you a trainer creating workout plans or a member joining a team?
                    </p>
                </div>

                {error && (
                    <div className="mb-8 rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-4 py-3 text-sm text-danger-700 dark:text-danger-200">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Trainer Card */}
                    <Card className="card-base hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <Award className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                            </div>
                            <CardTitle className="text-2xl">Trainer</CardTitle>
                            <CardDescription className="text-base">Create and manage workout plans</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                                    <span>Create custom training plans</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                                    <span>Manage team members</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                                    <span>Track member progress</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                                    <span>Generate invite codes</span>
                                </li>
                            </ul>
                            <Button
                                onClick={handleTrainerSelect}
                                disabled={isLoading}
                                className="w-full mt-6"
                                size="lg"
                            >
                                {isLoading ? 'Setting up...' : 'I\'m a Trainer'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Member Card */}
                    <Card className="card-base hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <Users className="w-16 h-16 text-secondary-600 dark:text-secondary-400" />
                            </div>
                            <CardTitle className="text-2xl">Member</CardTitle>
                            <CardDescription className="text-base">Join a team and complete workouts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary-600 dark:text-secondary-400 mt-1">✓</span>
                                    <span>Join training teams</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary-600 dark:text-secondary-400 mt-1">✓</span>
                                    <span>Complete assigned workouts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary-600 dark:text-secondary-400 mt-1">✓</span>
                                    <span>Log your progress</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-secondary-600 dark:text-secondary-400 mt-1">✓</span>
                                    <span>Track your stats</span>
                                </li>
                            </ul>
                            <Button
                                onClick={handleMemberSelect}
                                variant="outline"
                                className="w-full mt-6"
                                size="lg"
                            >
                                I'm a Member
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Invite Code Modal */}
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Join a Team</DialogTitle>
                        <DialogDescription>
                            Enter the invite code from your trainer to join their team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {error && (
                            <div className="rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-3 py-2 text-sm text-danger-700 dark:text-danger-200">
                                {error}
                            </div>
                        )}
                        <Input
                            placeholder="Enter invite code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            disabled={isJoiningTeam}
                            className="text-center text-lg tracking-widest"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowInviteModal(false)}
                                disabled={isJoiningTeam}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleJoinTeam}
                                disabled={isJoiningTeam}
                                className="flex-1"
                            >
                                {isJoiningTeam ? 'Joining...' : 'Join Team'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
