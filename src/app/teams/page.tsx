'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTeamForm } from '@/components/CreateTeamForm';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

type Team = {
    _id: string;
    name: string;
    description?: string;
    trainer?: {
        _id: string;
        name: string;
    };
    members?: Array<{ _id: string }>;
    memberRoles?: Array<{ user: string; role: 'trainer' | 'member' | 'coach' }>;
};

export default function TeamsPage() {
    const { user, activeTeam, setActiveTeam } = useAuth();
    const router = useRouter();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
    const userId = user?._id || '';

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/teams');
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load teams');
                }

                const data = await res.json();
                setTeams(data || []);

                // No redirect for members; allow viewing and switching teams
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load teams';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeams();
    }, [user, router, activeTeam.role]);

    const handleCreateTeam = async (data: { name: string; description: string }) => {
        try {
            const res = await fetch('/api/teams', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to create team');
            }
            const payload = await res.json();
            const team = payload.team || payload;
            setTeams(prev => [team, ...prev]);
            const membership = team.memberRoles?.find((m: any) => m.user === user?._id);
            const role = team.trainer?._id === user?._id ? 'trainer' : membership?.role || 'member';
            await setActiveTeam(team._id, role);
            setShowCreateForm(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create team');
        }
    };

    const handleJoinTeam = async () => {
        if (!inviteCode.trim()) return;
        setJoining(true);
        try {
            const res = await fetch('/api/teams/join', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error || 'Failed to join team');
            }
            const team = payload.team || payload;
            setTeams(prev => {
                const existing = prev.find(t => t._id === team._id);
                return existing ? prev : [team, ...prev];
            });
            const membership = team.memberRoles?.find((m: any) => m.user === user?._id);
            const role = team.trainer?._id === user?._id ? 'trainer' : membership?.role || 'member';
            await setActiveTeam(team._id, role);
            setShowJoinDialog(false);
            setInviteCode('');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to join team');
        } finally {
            setJoining(false);
        }
    };

    const handleSetActive = async (team: Team) => {
        try {
            const membership = team.memberRoles?.find(m => m.user === user?._id);
            const role = team.trainer?._id === user?._id ? 'trainer' : membership?.role || 'member';
            await setActiveTeam(team._id, role);
            const roleLabel = role === 'trainer' ? 'trainer' : role;
            setActiveFeedback(`Now working with "${team.name}" as ${roleLabel}.`);
            setTimeout(() => setActiveFeedback(null), 3500);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to set active team');
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <Navbar currentPage="teams" />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Page Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Teams</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your teams and members</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setShowJoinDialog(true)}
                            >
                                Join Team
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => setShowCreateForm(!showCreateForm)}
                            >
                                {showCreateForm ? 'Cancel' : 'Create Team'}
                            </Button>
                        </div>
                    </div>

                    {activeFeedback && (
                        <div className="mb-6">
                            <Alert className="border-success-200 bg-success-50 text-success-900 dark:border-success-900 dark:bg-success-950 dark:text-success-100">
                                <CheckCircle className="text-success-600 dark:text-success-300" />
                                <AlertTitle>Active team updated</AlertTitle>
                                <AlertDescription>{activeFeedback}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Create Form */}
                    {showCreateForm && (
                        <div className="mb-12 max-w-md">
                            <CreateTeamForm
                                userId={userId}
                                onSubmit={handleCreateTeam}
                            />
                        </div>
                    )}

                    {/* Teams Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            <Card className="border-0 shadow-lg col-span-full">
                                <CardContent className="py-12 text-center">
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">Loading teams...</p>
                                </CardContent>
                            </Card>
                        ) : error ? (
                            <Card className="border-0 shadow-lg col-span-full">
                                <CardContent className="py-12 text-center text-danger-600 dark:text-danger-400">
                                    <p className="text-lg">{error}</p>
                                </CardContent>
                            </Card>
                        ) : teams.length > 0 ? (
                            teams.map((team) => (
                                <Card
                                    key={team._id}
                                    className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <CardHeader>
                                        <CardTitle>{team.name}</CardTitle>
                                        <CardDescription>{team.description || 'No description'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>👥 {team.members?.length || 0} members</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/teams/${team._id}`} className="w-full">
                                                    <Button className="w-full" variant="default">
                                                        View Team
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant={activeTeam.teamId === team._id ? 'secondary' : 'outline'}
                                                    onClick={() => activeTeam.teamId !== team._id && handleSetActive(team)}
                                                    disabled={activeTeam.teamId === team._id}
                                                >
                                                    {activeTeam.teamId === team._id ? 'Active' : 'Set Active'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="border-0 shadow-lg col-span-full">
                                <CardContent className="py-12 text-center">
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">No teams yet</p>
                                    <p className="text-slate-400 dark:text-slate-500 mt-2">Create your first team to get started</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join a team</DialogTitle>
                        <DialogDescription>Enter the invite code provided by your trainer.</DialogDescription>
                    </DialogHeader>
                    <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="INVITE CODE"
                        className="uppercase"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
                        <Button onClick={handleJoinTeam} disabled={joining || !inviteCode.trim()}>
                            {joining ? 'Joining...' : 'Join Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
