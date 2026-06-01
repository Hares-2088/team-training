'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Trophy, CalendarCheck, PlayCircle, Sparkles } from 'lucide-react';
import { ActivityChart } from '@/components/ActivityChart';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateLabel, toDateKey } from '@/lib/date';

type Training = {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  exercises?: { name: string }[];
  dayFocus?: string;
  instructions?: string[];
  assignedTo?: { _id: string; name: string; email: string } | null;
  plan?: { _id: string; title: string; generationSource?: 'manual' | 'ai' | 'ai-fallback'; goalSummary?: string } | null;
};

type WorkoutLog = {
  _id: string;
  completedAt: string;
  training?: string | { _id: string; title?: string; scheduledDate?: string };
  exercises: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    weightUnit?: 'lbs' | 'kg' | 'bodyweight';
  }>;
};

type PersonalBestEvent = {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
};

export default function Dashboard() {
  const { user, loading, activeTeam } = useAuth();
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const effectiveRole = activeTeam.role || user?.role || null;
  const canManageTrainings = effectiveRole === 'trainer' || effectiveRole === 'coach';
  const isTrainerView = effectiveRole === 'trainer';

  useEffect(() => {
    const checkTeam = async () => {
      if (!loading && user && effectiveRole !== 'trainer') {
        try {
          const res = await fetch('/api/teams', { credentials: 'include' });
          if (res.ok) {
            const teams = (await res.json()) as unknown[];
            if (!Array.isArray(teams) || teams.length === 0) {
              router.push('/auth/role-select');
            }
          }
        } catch {
          // ignore
        }
      }
    };

    void checkTeam();
  }, [effectiveRole, loading, router, user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      setDataLoading(true);

      try {
        const trainingEndpoint = activeTeam.teamId
          ? `/api/users/${user._id}/trainings?teamId=${activeTeam.teamId}`
          : `/api/users/${user._id}/trainings`;
        const [trainingsRes, logsRes] = await Promise.all([
          fetch(trainingEndpoint, { credentials: 'include' }),
          fetch('/api/workout-logs?mine=true', { credentials: 'include' }),
        ]);

        if (trainingsRes.ok) {
          const trainingsData = (await trainingsRes.json()) as { trainings?: Training[] };
          setTrainings(trainingsData.trainings || []);
        } else {
          setTrainings([]);
        }

        if (logsRes.ok) {
          const logsData = (await logsRes.json()) as WorkoutLog[];
          setWorkoutLogs(Array.isArray(logsData) ? logsData : []);
        } else {
          setWorkoutLogs([]);
        }
      } catch {
        setTrainings([]);
        setWorkoutLogs([]);
      } finally {
        setDataLoading(false);
      }
    };

    void fetchDashboardData();
  }, [activeTeam.teamId, user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Navbar currentPage="dashboard" />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  const completedTrainingIds = new Set(
    workoutLogs
      .map((log) => (typeof log.training === 'string' ? log.training : log.training?._id))
      .filter((id): id is string => Boolean(id))
  );

  const now = new Date();
  const todayKey = toDateKey(now);
  const todaysTrainings = trainings
    .filter((training) => toDateKey(training.scheduledDate) === todayKey)
    .sort((a, b) => toDateKey(a.scheduledDate).localeCompare(toDateKey(b.scheduledDate)));
  const todaysWorkout =
    todaysTrainings.find((training) => !completedTrainingIds.has(training._id)) || todaysTrainings[0] || null;

  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const workoutsThisWeek = workoutLogs.filter(
    (log) => new Date(log.completedAt).getTime() >= weekStart.getTime()
  ).length;

  let streak = 0;
  if (workoutLogs.length > 0) {
    const uniqueDays = new Set(
      workoutLogs.map((log) => {
        const date = new Date(log.completedAt);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );
    const streakCursor = new Date();
    streakCursor.setHours(0, 0, 0, 0);
    const streakTodayKey = `${streakCursor.getFullYear()}-${streakCursor.getMonth()}-${streakCursor.getDate()}`;
    if (!uniqueDays.has(streakTodayKey)) {
      streakCursor.setDate(streakCursor.getDate() - 1);
    }
    let key = `${streakCursor.getFullYear()}-${streakCursor.getMonth()}-${streakCursor.getDate()}`;
    while (uniqueDays.has(key)) {
      streak += 1;
      streakCursor.setDate(streakCursor.getDate() - 1);
      key = `${streakCursor.getFullYear()}-${streakCursor.getMonth()}-${streakCursor.getDate()}`;
    }
  }

  const logsAsc = [...workoutLogs].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  const bestByExercise = new Map<string, number>();
  const events: PersonalBestEvent[] = [];
  logsAsc.forEach((log) => {
    log.exercises?.forEach((set) => {
      if (set.weightUnit === 'bodyweight') return;
      const score = set.weight * 1000 + set.reps;
      const currentBest = bestByExercise.get(set.exerciseName) ?? -1;
      if (score > currentBest && set.weight > 0 && set.reps > 0) {
        bestByExercise.set(set.exerciseName, score);
        events.push({
          exerciseName: set.exerciseName,
          weight: set.weight,
          reps: set.reps,
          date: log.completedAt,
        });
      }
    });
  });
  const recentPRs = events.slice(-3).reverse();

  const recentActivity = [...workoutLogs]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="dashboard" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {user?.name || 'User'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            {isTrainerView
              ? 'Keep your team consistent and progressing.'
              : 'Today’s focus, then log with speed.'}
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Today's Workout</CardTitle>
            <CardDescription>
              {isTrainerView
                ? 'Your scheduled training for today'
                : 'Choose your plan, start the session, then capture full feedback for the next AI update.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading today's training...</p>
            ) : todaysWorkout ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{todaysWorkout.title}</p>
                    {todaysWorkout.plan?.generationSource && todaysWorkout.plan.generationSource !== 'manual' && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        AI Plan
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {formatDateLabel(todaysWorkout.scheduledDate, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {todaysWorkout.dayFocus && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Focus: {todaysWorkout.dayFocus}
                    </p>
                  )}
                  {todaysWorkout.plan?.goalSummary && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Goal: {todaysWorkout.plan.goalSummary}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link href={`/dashboard/log-workout/${todaysWorkout._id}`}>
                    <Button className="h-11 w-full">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Quick Start
                    </Button>
                  </Link>
                  <Link href={`/trainings/${todaysWorkout._id}`}>
                    <Button variant="outline" className="h-11 w-full">
                      View Workout
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No scheduled workout for today yet.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/trainings">
                    <Button variant="outline">Browse Workout Plans</Button>
                  </Link>
                  {canManageTrainings && (
                    <Link href="/trainings/ai">
                      <Button>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Training
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Streak</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{streak}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">days in a row</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <CalendarCheck className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">This week</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{workoutsThisWeek}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">workouts done</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-violet-600">
                <Trophy className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Recent PRs</span>
              </div>
              <div className="mt-2 space-y-1">
                {recentPRs.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No PRs yet — keep logging.</p>
                ) : (
                  recentPRs.map((pr, index) => (
                    <p key={`${pr.exerciseName}-${index}`} className="text-sm text-slate-700 dark:text-slate-300">
                      {pr.exerciseName}: {pr.weight} × {pr.reps}
                    </p>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest completed workouts</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((log) => {
                    const training = typeof log.training === 'string' ? null : log.training;
                    return (
                      <div key={log._id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {training?.title || 'Workout'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(log.completedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Fast navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {canManageTrainings && (
                <Link href="/trainings/ai" className="block">
                  <Button className="w-full" variant="default">
                    Generate AI Training
                  </Button>
                </Link>
              )}
              {(canManageTrainings || isTrainerView) && (
                <Link href="/trainings/create" className="block">
                  <Button className="w-full" variant="outline">
                    Create Plan
                  </Button>
                </Link>
              )}
              <Link href="/trainings" className="block">
                <Button className="w-full" variant="outline">
                  Workout Plans
                </Button>
              </Link>
              <Link href="/dashboard/my-trainings" className="block">
                <Button className="w-full" variant="outline">
                  My Progress
                </Button>
              </Link>
              <Link href="/teams" className="block">
                <Button className="w-full" variant="outline">
                  Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
            <CardDescription>
              {isTrainerView
                ? "Your team's training activity by day"
                : 'Your workout logging activity by day'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart isTrainer={isTrainerView} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
