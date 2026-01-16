'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTeamForm } from '@/components/CreateTeamForm';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Team = {
    _id: string;
    name: string;
    description?: string;
    trainer?: {
        _id: string;
        name: string;
    };
    members?: Array<{ _id: string }>;
};

export default function TeamsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userId = '1'; // Replace with actual user ID from auth

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

                // Redirect members to their team details page
                if (user?.role === 'member' && data.length > 0) {
                    router.push(`/teams/${data[0]._id}`);
                    return;
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load teams';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeams();
    }, [user, router]);

    const handleCreateTeam = async (data: { name: string; description: string }) => {
        console.log('Creating team:', data);
        // Replace with actual API call
        setShowCreateForm(false);
    };

    return (
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
                    {user?.role === 'trainer' && (
                        <Button
                            size="lg"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? 'Cancel' : 'Create Team'}
                        </Button>
                    )}
                </div>

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
                                            <span>👨‍🏫 {team.trainer?.name || 'No trainer'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/teams/${team._id}`} className="flex-1">
                                                <Button className="w-full" variant="default">
                                                    View Team
                                                </Button>
                                            </Link>
                                            <Button variant="outline">Edit</Button>
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
    );
}
