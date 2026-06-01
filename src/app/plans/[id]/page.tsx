'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, Dumbbell, Sparkles, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateLabel } from '@/lib/date';

type Training = {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  exercises: Array<{ name: string; sets: number; reps: string; restTime?: number; notes?: string }>;
  status: 'scheduled' | 'completed' | 'cancelled';
  warmup?: string[];
  dayFocus?: string;
  cardioBlock?: {
    type?: string;
    durationMinutes?: number;
    intensity?: string;
    instructions?: string;
  };
  intensityNotes?: string;
  instructions?: string[];
  assignedTo?: { _id: string; name: string; email: string } | null;
};

type Plan = {
  _id: string;
  title: string;
  description?: string;
  isPersonal?: boolean;
  createdBy?: string;
  generationSource?: 'manual' | 'ai' | 'ai-fallback';
  goalSummary?: string;
  weeklyStructure?: string[];
  progressionNotes?: string;
  cardioSummary?: string;
  safetyNotes?: string;
  assignee?: { _id: string; name: string; email: string } | null;
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
  const isAIPlan = plan?.generationSource && plan.generationSource !== 'manual';

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plans/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || 'Failed to load plan');
        }
        const data = (await res.json()) as { plan: Plan; trainings: Training[] };
        setPlan(data.plan);
        setTrainings(data.trainings || []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load plan');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlan();
  }, [id]);

  useEffect(() => {
    if (!trainings.length) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/workout-logs', { credentials: 'include' });
        if (!res.ok) return;
        const logs = (await res.json()) as Array<{ training: string | { _id: string } }>;
        const ids = new Set(
          logs.map((log) => (typeof log.training === 'string' ? log.training : log.training._id))
        );
        setCompletedIds(ids);
      } catch {
        // ignore completion hints
      }
    };

    void fetchLogs();
  }, [trainings.length]);

  const handleDeletePlan = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to delete plan');
      }
      router.push('/trainings');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete plan');
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
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to delete training');
      }
      setTrainings((prev) => prev.filter((training) => training._id !== trainingId));
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete training');
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
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-600 dark:text-slate-400 sm:px-6 lg:px-8">
          Loading plan...
        </main>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar currentPage="workouts" />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8 text-center text-red-600">{error || 'Plan not found'}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="workouts" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/trainings"
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Workout Plans
        </Link>

        <Card className="mb-8 shadow-lg">
          <CardHeader className="border-b border-slate-200 pb-6 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <CardTitle className="text-3xl">{plan.title}</CardTitle>
                  {plan.isPersonal && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Personal
                    </span>
                  )}
                  {isAIPlan && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI Generated
                    </span>
                  )}
                </div>
                {plan.description && <CardDescription className="mt-1 text-base">{plan.description}</CardDescription>}
                {plan.assignee?.name && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Assigned to {plan.assignee.name}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Dumbbell className="h-4 w-4" />
              {trainings.length} workout{trainings.length !== 1 ? 's' : ''}
            </div>

            {(plan.goalSummary || plan.weeklyStructure?.length || plan.progressionNotes || plan.cardioSummary || plan.safetyNotes) && (
              <div className="grid gap-4 md:grid-cols-2">
                {plan.goalSummary && (
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Goal Summary</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{plan.goalSummary}</p>
                  </div>
                )}
                {plan.weeklyStructure?.length ? (
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Weekly Structure</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {plan.weeklyStructure.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {plan.progressionNotes && (
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Progression</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{plan.progressionNotes}</p>
                  </div>
                )}
                {plan.cardioSummary && (
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cardio Summary</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{plan.cardioSummary}</p>
                  </div>
                )}
                {plan.safetyNotes && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40 md:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Safety Notes</p>
                    <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{plan.safetyNotes}</p>
                  </div>
                )}
              </div>
            )}

            {canManage && (
              <div className="flex gap-3">
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Workouts
        </h2>

        {trainings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500 dark:text-slate-400">
              No workouts in this plan yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trainings.map((training) => {
              const userCompleted = completedIds.has(training._id);
              const displayStatus = userCompleted ? 'completed' : training.status;
              return (
                <Card key={training._id} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{training.title}</CardTitle>
                        {training.description && <CardDescription>{training.description}</CardDescription>}
                        {training.dayFocus && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Focus: {training.dayFocus}
                          </p>
                        )}
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${statusColors[displayStatus] || ''}`}>
                        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span>📅 {formatDateLabel(training.scheduledDate)}</span>
                      <span>💪 {training.exercises.length} exercise{training.exercises.length !== 1 ? 's' : ''}</span>
                      {training.assignedTo?.name && <span>👤 {training.assignedTo.name}</span>}
                    </div>

                    {training.warmup?.length ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Warm-up</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                          {training.warmup.join(' • ')}
                        </p>
                      </div>
                    ) : null}

                    {training.cardioBlock?.type || training.cardioBlock?.instructions ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cardio Block</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                          {[training.cardioBlock?.type, training.cardioBlock?.durationMinutes ? `${training.cardioBlock.durationMinutes} min` : '', training.cardioBlock?.intensity]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                        {training.cardioBlock?.instructions && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{training.cardioBlock.instructions}</p>
                        )}
                      </div>
                    ) : null}

                    {training.intensityNotes && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">Intensity: {training.intensityNotes}</p>
                    )}

                    {training.instructions?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {training.instructions.map((instruction) => (
                          <Badge key={instruction} variant="secondary" className="text-xs">
                            {instruction}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    {training.exercises.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {training.exercises.map((exercise) => (
                          <Badge key={`${training._id}-${exercise.name}`} variant="secondary" className="text-xs">
                            {exercise.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;<span className="font-semibold">{plan.title}</span>&quot;?
              This will also delete all {trainings.length} workout{trainings.length !== 1 ? 's' : ''} in
              this plan. This action cannot be undone.
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
