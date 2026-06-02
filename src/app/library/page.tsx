'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateLabel } from '@/lib/date';

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

type Plan = {
    _id: string;
    title: string;
    isPersonal?: boolean;
};

type MyWorkout = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    plan?: { _id: string; title?: string } | null;
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
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [addingToPlan, setAddingToPlan] = useState(false);

    const [myWorkouts, setMyWorkouts] = useState<MyWorkout[]>([]);
    const [myWorkoutsLoading, setMyWorkoutsLoading] = useState(true);
    const [newWorkoutTitle, setNewWorkoutTitle] = useState('');
    const [newWorkoutDate, setNewWorkoutDate] = useState('');
    const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
    const [creatingWorkout, setCreatingWorkout] = useState(false);
    const [showMyWorkoutPlanSelector, setShowMyWorkoutPlanSelector] = useState(false);
    const [selectedMyWorkoutId, setSelectedMyWorkoutId] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/workout-templates');
                if (!res.ok) throw new Error('Failed to load templates');
                const data = await res.json();
                const loadedTemplates = data.templates || [];
                setTemplates(loadedTemplates);
                setFilteredTemplates(loadedTemplates);

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

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data?.plans) ? data.plans : [];
                    setPlans(list);
                    if (list.length > 0) {
                        setSelectedPlanId(list[0]._id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err);
            }
        };
        fetchPlans();
    }, [user, activeTeam.role, activeTeam.teamId]);

    useEffect(() => {
        const fetchMyWorkouts = async () => {
            try {
                const res = await fetch('/api/trainings', { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to load workouts');
                const data = await res.json();
                const allTrainings = Array.isArray(data?.trainings) ? data.trainings : [];
                const standalone = allTrainings.filter((training: MyWorkout) => !training.plan?._id);
                setMyWorkouts(standalone);
            } catch {
                setMyWorkouts([]);
            } finally {
                setMyWorkoutsLoading(false);
            }
        };

        void fetchMyWorkouts();
    }, []);

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
    const canAddTemplateToPlan = isTrainer || isCoach;

    const addToPlan = async (templateId: string, planIdOverride?: string) => {
        const targetPlanId = planIdOverride ?? selectedPlanId;
        if (!targetPlanId) {
            alert('Please select a plan');
            return;
        }

        setAddingToPlan(true);
        try {
            const res = await fetch(`/api/workout-templates/${templateId}/add-to-plan`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: targetPlanId }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to add to plan');
            }

            const data = await res.json();
            setShowPlanSelector(false);
            alert('Workout added to plan!');
            router.push(`/plans/${data.planId}`);
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

    const createMyWorkout = async () => {
        if (!newWorkoutTitle.trim()) {
            alert('Workout title is required');
            return;
        }
        if (!newWorkoutDate) {
            alert('Workout date is required');
            return;
        }
        if (!activeTeam.teamId) {
            alert('Select an active team first');
            return;
        }

        setCreatingWorkout(true);
        try {
            const res = await fetch('/api/trainings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newWorkoutTitle.trim(),
                    description: newWorkoutDescription.trim(),
                    scheduledDate: newWorkoutDate,
                    exercises: [],
                    team: activeTeam.teamId,
                    isPersonal: !canAddTemplateToPlan,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to create workout');
            }

            const payload = await res.json();
            const created = payload?.training as MyWorkout | undefined;
            if (created?._id) {
                setMyWorkouts((prev) => [created, ...prev]);
            }
            setNewWorkoutTitle('');
            setNewWorkoutDate('');
            setNewWorkoutDescription('');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to create workout');
        } finally {
            setCreatingWorkout(false);
        }
    };

    const addMyWorkoutToPlan = async (workoutId: string, planIdOverride?: string) => {
        const targetPlanId = planIdOverride ?? selectedPlanId;
        if (!targetPlanId) {
            alert('Please select a plan');
            return;
        }

        setAddingToPlan(true);
        try {
            const res = await fetch(`/api/trainings/${workoutId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: targetPlanId }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.error || 'Failed to add workout to plan');
            }

            setShowMyWorkoutPlanSelector(false);
            setMyWorkouts((prev) => prev.filter((workout) => workout._id !== workoutId));
            alert('Workout added to plan!');
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to add workout to plan');
        } finally {
            setAddingToPlan(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">Workouts Library</h2>
                    <p className="text-slate-600 dark:text-slate-400">Curated templates and your own workouts in one place</p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>My Workouts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-1">
                                <Label htmlFor="my-workout-title">Workout Title</Label>
                                <Input
                                    id="my-workout-title"
                                    className="mt-2"
                                    value={newWorkoutTitle}
                                    onChange={(event) => setNewWorkoutTitle(event.target.value)}
                                    placeholder="e.g. Upper Body Session"
                                />
                            </div>
                            <div>
                                <Label htmlFor="my-workout-date">Scheduled Date</Label>
                                <div className="mt-2">
                                    <DatePicker
                                        id="my-workout-date"
                                        value={newWorkoutDate}
                                        onChange={setNewWorkoutDate}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="my-workout-description">Description (optional)</Label>
                                <Input
                                    id="my-workout-description"
                                    className="mt-2"
                                    value={newWorkoutDescription}
                                    onChange={(event) => setNewWorkoutDescription(event.target.value)}
                                    placeholder="Short note"
                                />
                            </div>
                        </div>

                        <Button type="button" onClick={createMyWorkout} disabled={creatingWorkout}>
                            {creatingWorkout ? 'Creating...' : 'Create Workout'}
                        </Button>

                        {myWorkoutsLoading ? (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Loading your workouts...</p>
                        ) : myWorkouts.length === 0 ? (
                            <p className="text-sm text-slate-600 dark:text-slate-400">No standalone workouts yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myWorkouts.map((workout) => (
                                    <Card key={workout._id} className="border-slate-200 dark:border-slate-800">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">{workout.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">📅 {formatDateLabel(workout.scheduledDate)}</p>
                                            {workout.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{workout.description}</p>
                                            )}
                                            <div className="flex gap-2">
                                                <Link href={`/trainings/${workout._id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full">View</Button>
                                                </Link>
                                                <Button
                                                    className="flex-1"
                                                    disabled={plans.length === 0 || addingToPlan}
                                                    onClick={() => {
                                                        if (plans.length === 1) {
                                                            addMyWorkoutToPlan(workout._id);
                                                            return;
                                                        }
                                                        setSelectedMyWorkoutId(workout._id);
                                                        setShowMyWorkoutPlanSelector(true);
                                                    }}
                                                >
                                                    Add to Plan
                                                </Button>
                                            </div>
                                            {plans.length === 0 && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Create a plan first to attach this workout.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

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
                                        {canAddTemplateToPlan ? (
                                            <Button
                                                variant="outline"
                                                className="w-full sm:w-auto flex-1 sm:flex-none"
                                                disabled={addingToPlan}
                                                onClick={() => {
                                                    setSelectedTemplateId(t._id);
                                                    if (plans.length === 1) {
                                                        addToPlan(t._id);
                                                    } else {
                                                        setShowPlanSelector(true);
                                                    }
                                                }}
                                            >
                                                {addingToPlan ? 'Adding...' : 'Add Workout to Plan'}
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

            {showPlanSelector && canAddTemplateToPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Select Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plans.length === 0 ? (
                                <p className="text-center text-slate-600 dark:text-slate-400">No plans available</p>
                            ) : (
                                <div className="space-y-2">
                                    {plans.map((plan) => (
                                        <button
                                            key={plan._id}
                                            onClick={() => addToPlan(selectedTemplateId, plan._id)}
                                            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${selectedPlanId === plan._id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <p className="font-medium">{plan.title}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {plan.isPersonal ? 'Personal plan' : 'Team plan'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowPlanSelector(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showMyWorkoutPlanSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Select Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plans.length === 0 ? (
                                <p className="text-center text-slate-600 dark:text-slate-400">No plans available</p>
                            ) : (
                                <div className="space-y-2">
                                    {plans.map((plan) => (
                                        <button
                                            key={plan._id}
                                            onClick={() => addMyWorkoutToPlan(selectedMyWorkoutId, plan._id)}
                                            className="w-full rounded-lg border-2 border-slate-200 p-3 text-left transition-colors hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                                        >
                                            <p className="font-medium">{plan.title}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {plan.isPersonal ? 'Personal plan' : 'Team plan'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowMyWorkoutPlanSelector(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
