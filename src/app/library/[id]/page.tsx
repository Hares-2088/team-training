'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function TemplateDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [showTeamSelector, setShowTeamSelector] = useState(false);
    const [addingToPlan, setAddingToPlan] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await fetch(`/api/workout-templates/${id}`);
                if (!res.ok) throw new Error('Failed to load template');
                const data = await res.json();
                setTemplate(data.template);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load template');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTemplate();
    }, [id]);

    // Fetch teams if trainer
    useEffect(() => {
        if (user?.role === 'trainer') {
            const fetchTeams = async () => {
                try {
                    const res = await fetch('/api/teams');
                    if (res.ok) {
                        const data = await res.json();
                        setTeams(data.teams || []);
                        if (data.teams && data.teams.length > 0) {
                            setSelectedTeamId(data.teams[0]._id);
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch teams:', err);
                }
            };
            fetchTeams();
        }
    }, [user]);

    const isTrainer = user?.role === 'trainer';

    const addToPlan = async () => {
        if (isTrainer && !selectedTeamId) {
            alert('Please select a team');
            return;
        }

        setAddingToPlan(true);
        try {
            const res = await fetch(`/api/workout-templates/${id}/add-to-plan`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: selectedTeamId || undefined }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to add to plan');
            }

            const data = await res.json();
            setShowTeamSelector(false);
            alert('Template added to team plan!');
            router.push(`/trainings/${data.trainingId}`);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to add to plan');
        } finally {
            setAddingToPlan(false);
        }
    };

    const quickLog = async () => {
        try {
            const res = await fetch(`/api/workout-templates/${id}/instantiate`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to start quick log');
            }
            const { trainingId } = await res.json();
            router.push(`/dashboard/log-workout/${trainingId}`);
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to start quick log');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-6">
                    <Link href="/library">
                        <Button variant="ghost">← Back to Library</Button>
                    </Link>
                </div>

                {loading ? (
                    <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>
                ) : error ? (
                    <Card><CardContent className="py-12 text-center text-red-600">{error}</CardContent></Card>
                ) : !template ? (
                    <Card><CardContent className="py-12 text-center">Template not found</CardContent></Card>
                ) : (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">{template.title}</CardTitle>
                            {template.description && (
                                <p className="text-slate-600 dark:text-slate-400 mt-2">{template.description}</p>
                            )}
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {template.category && <Badge variant="secondary">{template.category}</Badge>}
                                {template.difficulty && <Badge>{template.difficulty}</Badge>}
                                {typeof template.estimatedDuration === 'number' && (
                                    <Badge variant="outline">{template.estimatedDuration} mins</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold mb-3">Exercises</h3>
                            <div className="space-y-3">
                                {template.exercises?.map((ex: any, idx: number) => (
                                    <div key={`ex-${idx}`} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{ex.name}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{ex.reps} reps • {ex.sets} sets • Rest {ex.restTime}s</p>
                                            </div>
                                        </div>
                                        {ex.notes && <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">Notes: {ex.notes}</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-2">
                                {isTrainer && (
                                    <>
                                        <Button
                                            className="flex-1 sm:flex-none w-full sm:w-auto"
                                            disabled={addingToPlan}
                                            onClick={() => {
                                                if (teams.length === 1) {
                                                    addToPlan();
                                                } else {
                                                    setShowTeamSelector(true);
                                                }
                                            }}
                                        >
                                            {addingToPlan ? 'Adding...' : 'Add to Team Plan'}
                                        </Button>
                                        <Link href="/trainings" className="flex-1 sm:flex-none">
                                            <Button variant="outline" className="w-full sm:w-auto">Browse Plans</Button>
                                        </Link>
                                    </>
                                )}
                                {!isTrainer && (
                                    <div className="flex-1 sm:flex-none">
                                        <Button variant="outline" className="w-full sm:w-auto" onClick={quickLog}>Quick Log</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Team Selector Modal */}
                {showTeamSelector && isTrainer && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-sm">
                            <CardHeader>
                                <CardTitle>Select a Team</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teams.length === 0 ? (
                                    <p className="text-slate-600 dark:text-slate-400">No teams available</p>
                                ) : (
                                    <div className="space-y-2">
                                        {teams.map((team: any) => (
                                            <button
                                                key={team._id}
                                                onClick={() => {
                                                    setSelectedTeamId(team._id);
                                                    addToPlan();
                                                }}
                                                className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
                                            >
                                                {team.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowTeamSelector(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
