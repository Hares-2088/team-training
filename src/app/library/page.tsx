'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

type Template = {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    estimatedDuration?: number;
    exercises: { name: string; sets: number; reps: string; restTime: number; notes?: string }[];
};

export default function WorkoutLibraryPage() {
    const { user, activeTeam } = useAuth();
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [allTags, setAllTags] = useState<string[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [showTeamSelector, setShowTeamSelector] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [addingToPlan, setAddingToPlan] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/workout-templates');
                if (!res.ok) throw new Error('Failed to load templates');
                const data = await res.json();
                const loadedTemplates = data.templates || [];
                setTemplates(loadedTemplates);
                setFilteredTemplates(loadedTemplates);

                // Extract all unique tags
                const tagsSet = new Set<string>();
                loadedTemplates.forEach((t: Template) => {
                    t.tags?.forEach((tag: string) => tagsSet.add(tag));
                });
                setAllTags(Array.from(tagsSet).sort());
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    // Fetch teams if trainer
    useEffect(() => {
        const role = activeTeam.role || user?.role;
        if (role === 'trainer') {
            const fetchTeams = async () => {
                try {
                    const res = await fetch('/api/teams');
                    if (res.ok) {
                        const data = await res.json();
                        const list = Array.isArray(data) ? data : data.teams || [];
                        setTeams(list);
                        if (list.length > 0) {
                            setSelectedTeamId(activeTeam.teamId || list[0]._id);
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch teams:', err);
                }
            };
            fetchTeams();
        }
    }, [user, activeTeam.role]);

    // Filter templates when selected tags change
    useEffect(() => {
        if (selectedTags.size === 0) {
            setFilteredTemplates(templates);
        } else {
            const filtered = templates.filter((t) =>
                t.tags?.some((tag: string) => selectedTags.has(tag))
            );
            setFilteredTemplates(filtered);
        }
    }, [selectedTags, templates]);

    const toggleTag = (tag: string) => {
        const newTags = new Set(selectedTags);
        if (newTags.has(tag)) {
            newTags.delete(tag);
        } else {
            newTags.add(tag);
        }
        setSelectedTags(newTags);
    };

    const role = activeTeam.role || user?.role;
    const isTrainer = role === 'trainer';
    const isCoach = role === 'coach';

    const addToPlan = async (templateId: string) => {
        if (isTrainer && !selectedTeamId) {
            alert('Please select a team');
            return;
        }

        setAddingToPlan(true);
        try {
            const res = await fetch(`/api/workout-templates/${templateId}/add-to-plan`, {
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

    const quickLog = async (templateId: string) => {
        try {
            const res = await fetch(`/api/workout-templates/${templateId}/instantiate`, {
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Workouts Library</h2>
                    <p className="text-slate-600 dark:text-slate-400">Curated templates you can browse and use</p>
                </div>

                {/* Tag Filters */}
                {!loading && allTags.length > 0 && (
                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <h3 className="font-semibold mb-3 text-sm">Filter by Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.has(tag)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <Card><CardContent className="py-12 text-center">Loading templates...</CardContent></Card>
                ) : error ? (
                    <Card><CardContent className="py-12 text-center text-red-600">{error}</CardContent></Card>
                ) : filteredTemplates.length === 0 ? (
                    <Card><CardContent className="py-12 text-center">No templates match your filters</CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((t) => (
                            <Card key={t._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{t.title}</CardTitle>
                                            {t.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                                            )}
                                            <div className="mt-3 flex gap-2 flex-wrap">
                                                {t.category && <Badge variant="secondary">{t.category}</Badge>}
                                                {t.difficulty && <Badge>{t.difficulty}</Badge>}
                                                {typeof t.estimatedDuration === 'number' && (
                                                    <Badge variant="outline">{t.estimatedDuration} mins</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Link href={`/library/${t._id}`} className="flex-1">
                                            <Button className="w-full sm:w-auto">View Details</Button>
                                        </Link>
                                        {isTrainer ? (
                                            <Button
                                                variant="outline"
                                                className="w-full sm:w-auto flex-1 sm:flex-none"
                                                disabled={addingToPlan}
                                                onClick={() => {
                                                    setSelectedTemplateId(t._id);
                                                    if (teams.length === 1) {
                                                        // Only one team, add directly
                                                        addToPlan(t._id);
                                                    } else {
                                                        // Show team selector
                                                        setShowTeamSelector(true);
                                                    }
                                                }}
                                            >
                                                {addingToPlan ? 'Adding...' : 'Add to Plan'}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full sm:w-auto flex-1 sm:flex-none"
                                                onClick={() => quickLog(t._id)}
                                            >
                                                Quick Log
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Team Selector Modal for Trainers */}
            {showTeamSelector && isTrainer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Select Team</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teams.length === 0 ? (
                                <p className="text-center text-slate-600 dark:text-slate-400">No teams available</p>
                            ) : (
                                <div className="space-y-2">
                                    {teams.map((team) => (
                                        <button
                                            key={team._id}
                                            onClick={() => setSelectedTeamId(team._id)}
                                            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${selectedTeamId === team._id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <p className="font-medium">{team.name}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {team.members?.length || 0} members
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowTeamSelector(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!selectedTeamId || addingToPlan}
                                    onClick={() => addToPlan(selectedTemplateId)}
                                >
                                    {addingToPlan ? 'Adding...' : 'Add to Team'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
