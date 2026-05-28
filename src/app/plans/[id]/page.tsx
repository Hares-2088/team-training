'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Navbar } from '@/components/Navbar';
import { ChevronLeft, Trash2, Calendar, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateLabel } from '@/lib/date';

type Training = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    exercises: Array<{ name: string; sets: number; reps: string; restTime?: number; notes?: string }>;
    status: 'scheduled' | 'completed' | 'cancelled';
};

type Plan = {
    _id: string;
    title: string;
    description?: string;
    isPersonal?: boolean;
    createdBy?: string;
};

export default function PlanDetailPage() {
    const { user, activeTeam } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [plan, setPlan] = useState<Plan | null>(null);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    const effectiveRole = activeTeam.role || user?.role || null;
    const canManage = effectiveRole === 'trainer' || effectiveRole === 'coach';

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/plans/${id}`, { credentials: 'include' });
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load plan');
                }
                const data = await res.json();
                setPlan(data.plan);
                setTrainings(data.trainings || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load plan');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

    // Fetch workout logs to know which trainings the user completed
    useEffect(() => {
        if (!trainings.length) return;
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/workout-logs', { credentials: 'include' });
                if (!res.ok) return;
                const logs: Array<{ training: string | { _id: string } }> = await res.json();
                const ids = new Set(
                    logs.map((l) => (typeof l.training === 'string' ? l.training : l.training._id))
                );
                setCompletedIds(ids);
            } catch {
                // ignore
            }
        };
        fetchLogs();
    }, [trainings.length]);

    const handleDeletePlan = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/plans/${id}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete plan');
            }
            router.push('/trainings');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete plan');
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleDeleteTraining = async (trainingId: string) => {
        try {
            const res = await fetch(`/api/trainings/${trainingId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete training');
            }
            setTrainings((prev) => prev.filter((t) => t._id !== trainingId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete training');
        }
    };

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="workouts" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-600 dark:text-slate-400">
                    Loading plan...
                </main>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="workouts" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card>
                        <CardContent className="py-8 text-center text-red-600">
                            {error || 'Plan not found'}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back link */}
                <Link
                    href="/trainings"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Workout Plans
                </Link>

                {/* Plan Header */}
                <Card className="shadow-lg mb-8">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="text-3xl">{plan.title}</CardTitle>
                                    {plan.isPersonal && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            Personal
                                        </span>
                                    )}
                                </div>
                                {plan.description && (
                                    <CardDescription className="text-base mt-1">
                                        {plan.description}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Dumbbell className="w-4 h-4" />
                            {trainings.length} training session{trainings.length !== 1 ? 's' : ''}
                        </div>
                        {canManage && (
                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Plan
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Training Sessions */}
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Training Sessions
                </h2>

                {trainings.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-slate-500 dark:text-slate-400">
                            No training sessions in this plan yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {trainings.map((training) => {
                            const userCompleted = completedIds.has(training._id);
                            const displayStatus = userCompleted ? 'completed' : training.status;
                            return (
                                <Card key={training._id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <CardTitle className="text-lg">{training.title}</CardTitle>
                                                {training.description && (
                                                    <CardDescription>{training.description}</CardDescription>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColors[displayStatus] || ''}`}>
                                                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
                                            <span>📅 {formatDateLabel(training.scheduledDate)}</span>
                                            <span>💪 {training.exercises.length} exercise{training.exercises.length !== 1 ? 's' : ''}</span>
                                        </div>

                                        {/* Exercise summary */}
                                        {training.exercises.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {training.exercises.map((ex, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {ex.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Link href={`/trainings/${training._id}`} className="flex-1">
                                                <Button className="w-full" variant="default" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                            {!userCompleted && (
                                                <Link href={`/dashboard/log-workout/${training._id}`} className="sm:flex-none">
                                                    <Button className="w-full sm:w-auto" variant="outline" size="sm">
                                                        Log Workout
                                                    </Button>
                                                </Link>
                                            )}
                                            {canManage && (
                                                <>
                                                    <Link href={`/trainings/${training._id}/edit`} className="sm:flex-none">
                                                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="sm:flex-none"
                                                        onClick={() => handleDeleteTraining(training._id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Delete Plan Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;<span className="font-semibold">{plan.title}</span>&quot;?
                            This will also delete all {trainings.length} training session{trainings.length !== 1 ? 's' : ''} in this plan. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePlan} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
