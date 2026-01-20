'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function SelectTeamPage() {
    const router = useRouter();
    const { activeTeam, setActiveTeam, user } = useAuth();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settingId, setSettingId] = useState<string | null>(null);

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const res = await fetch('/api/teams', { credentials: 'include' });
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load teams');
                }
                const data = await res.json();
                setTeams(data);
                if (data.length === 1) {
                    const only = data[0];
                    const membership = only.members?.find((m: any) => m._id === user?._id) || {};
                    const role = only.trainer?._id === user?._id ? 'trainer' : membership.role || 'member';
                    await setActiveTeam(only._id, role);
                    router.push('/dashboard');
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load teams';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        loadTeams();
    }, [router, setActiveTeam, user]);

    const handleSelect = async (team: any) => {
        try {
            setSettingId(team._id);
            const membership = team.members?.find((m: any) => m._id === user?._id) || {};
            const role = team.trainer?._id === user?._id ? 'trainer' : membership.role || 'member';
            await setActiveTeam(team._id, role);
            router.push('/dashboard');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to set active team');
        } finally {
            setSettingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <Navbar currentPage="teams" />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Choose your team</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Select which team to work with for plans and calendar. You can change this anytime from the Teams page.</p>
                {loading ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-10 text-center text-slate-500 dark:text-slate-400">Loading teams...</CardContent>
                    </Card>
                ) : error ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-10 text-center text-red-600 dark:text-red-400">{error}</CardContent>
                    </Card>
                ) : teams.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-10 text-center text-slate-600 dark:text-slate-400">No teams yet. Create or join one to continue.</CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team) => (
                            <Card key={team._id} className={team._id === activeTeam.teamId ? 'ring-2 ring-primary-500' : ''}>
                                <CardHeader>
                                    <CardTitle>{team.name}</CardTitle>
                                    <CardDescription>{team.description || 'No description'}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        <div>👥 {team.members?.length || 0} members</div>
                                    </div>
                                    <Button onClick={() => handleSelect(team)} disabled={settingId === team._id}>
                                        {settingId === team._id ? 'Setting...' : team._id === activeTeam.teamId ? 'Active' : 'Select'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
