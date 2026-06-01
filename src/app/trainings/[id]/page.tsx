'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flame, HeartPulse, Timer, User2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateLabel } from '@/lib/date';

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restTime?: number;
  notes?: string;
};

type Training = {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  exercises: Exercise[];
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
  workoutPlan?: { _id: string; title: string } | null;
};

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, activeTeam } = useAuth();
  const id = params.id as string;

  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLog, setHasLog] = useState(false);

  const effectiveRole = activeTeam.role || user?.role || null;
  const canManage = effectiveRole === 'trainer' || effectiveRole === 'coach';

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const res = await fetch(`/api/trainings/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || 'Failed to load training');
        }
        const data = (await res.json()) as Training;
        setTraining(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load training');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTraining();
  }, [id]);

  useEffect(() => {
    if (!training) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/workout-logs', { credentials: 'include' });
        if (!res.ok) return;
        const logs = (await res.json()) as Array<{ training: string | { _id: string } }>;
        setHasLog(
          logs.some((log) => (typeof log.training === 'string' ? log.training : log.training._id) === training._id)
        );
      } catch {
        setHasLog(false);
      }
    };

    void fetchLogs();
  }, [training]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar currentPage="workouts" />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-600 dark:text-slate-400 sm:px-6 lg:px-8">
          Loading workout...
        </main>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar currentPage="workouts" />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8 text-center text-red-600">{error || 'Workout not found'}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const cardioSummary = [
    training.cardioBlock?.type,
    training.cardioBlock?.durationMinutes ? `${training.cardioBlock.durationMinutes} min` : '',
    training.cardioBlock?.intensity,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="workouts" />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="mb-8 shadow-lg">
          <CardHeader className="gap-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-3xl">{training.title}</CardTitle>
                {training.description && <CardDescription className="mt-2 text-base">{training.description}</CardDescription>}
              </div>
              <Badge variant={training.status === 'completed' || hasLog ? 'default' : 'secondary'}>
                {hasLog ? 'Completed' : training.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>📅 {formatDateLabel(training.scheduledDate)}</span>
              {training.dayFocus && <span>🎯 {training.dayFocus}</span>}
              {training.assignedTo?.name && <span>👤 {training.assignedTo.name}</span>}
              {training.workoutPlan?._id && (
                <Link href={`/plans/${training.workoutPlan._id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  Plan: {training.workoutPlan.title}
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {training.warmup?.length ? (
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Flame className="h-4 w-4" />
                  Warm-up
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {training.warmup.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(cardioSummary || training.cardioBlock?.instructions) && (
              <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <HeartPulse className="h-4 w-4" />
                  Cardio Block
                </div>
                {cardioSummary && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{cardioSummary}</p>}
                {training.cardioBlock?.instructions && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{training.cardioBlock.instructions}</p>
                )}
              </div>
            )}

            {(training.intensityNotes || training.instructions?.length || training.assignedTo?.name) && (
              <div className="grid gap-4 md:grid-cols-2">
                {training.intensityNotes && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Timer className="h-4 w-4" />
                      Intensity Notes
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{training.intensityNotes}</p>
                  </div>
                )}
                {training.assignedTo?.name && (
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <User2 className="h-4 w-4" />
                      Assigned User
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{training.assignedTo.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{training.assignedTo.email}</p>
                  </div>
                )}
              </div>
            )}

            {training.instructions?.length ? (
              <div>
                <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {training.instructions.map((instruction) => (
                    <li key={instruction}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h2 className="mb-4 text-lg font-semibold">Exercises</h2>
              <div className="space-y-4">
                {training.exercises.map((exercise, index) => (
                  <Card key={`${exercise.name}-${index}`} className="border border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold">{exercise.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {exercise.sets} sets × {exercise.reps}
                          </p>
                        </div>
                        {exercise.restTime ? (
                          <Badge variant="secondary">Rest {exercise.restTime}s</Badge>
                        ) : null}
                      </div>
                      {exercise.notes && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{exercise.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!hasLog && (
                <Link href={`/dashboard/log-workout/${training._id}`} className="flex-1">
                  <Button className="w-full">Log Workout</Button>
                </Link>
              )}
              {canManage && (
                <Link href={`/trainings/${training._id}/edit`} className="sm:flex-none">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Edit Workout
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
