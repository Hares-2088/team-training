'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ActivityChart } from '@/components/ActivityChart';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Flame, Trophy, CalendarCheck, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDateLabel, toDateKey } from '@/lib/date';

type Training = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    exercises?: { name: string }[];
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

    useEffect(() => {
        const checkTeam = async () => {
            if (!loading && user && effectiveRole !== 'trainer') {
                try {
                    const res = await fetch('/api/teams', { credentials: 'include' });
                    if (res.ok) {
                        const teams = await res.json();
                        if (!Array.isArray(teams) || teams.length === 0) {
                            // No team, not a trainer -> go to role select
                            router.push('/auth/role-select');
                        }
                    }
                } catch {
                    // ignore
                }
            }
        };
        checkTeam();
    }, [loading, user, effectiveRole, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setDataLoading(true);

            try {
                const [trainingsRes, logsRes] = await Promise.all([
                    fetch('/api/trainings', { credentials: 'include' }),
                    // Use ?mine=true so trainers get their own personal logs for stats
                    fetch('/api/workout-logs?mine=true', { credentials: 'include' }),
                ]);

                if (trainingsRes.ok) {
                    const trainingsData = await trainingsRes.json();
                    setTrainings(trainingsData.trainings || []);
                } else {
                    setTrainings([]);
                }

                if (logsRes.ok) {
                    const logsData = await logsRes.json();
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

        fetchDashboardData();
    }, [user, activeTeam.teamId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <Navbar currentPage="dashboard" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">Loading...</div>
                </main>
            </div>
        );
    }

    const userRole = effectiveRole || 'member';
    const canManageTrainings = userRole === 'trainer' || userRole === 'coach';
    const isTrainerView = userRole === 'trainer';

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
    const workoutsThisWeek = workoutLogs.filter((log) => new Date(log.completedAt).getTime() >= weekStart.getTime()).length;

    let streak = 0;
    if (workoutLogs.length > 0) {
        const uniqueDays = new Set(
            workoutLogs.map((log) => {
                const d = new Date(log.completedAt);
                return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            })
        );
        const streakCursor = new Date();
        streakCursor.setHours(0, 0, 0, 0);
        const todayKey = `${streakCursor.getFullYear()}-${streakCursor.getMonth()}-${streakCursor.getDate()}`;
        if (!uniqueDays.has(todayKey)) {
            streakCursor.setDate(streakCursor.getDate() - 1);
        }
        let key = `${streakCursor.getFullYear()}-${streakCursor.getMonth()}-${streakCursor.getDate()}`;
        while (uniqueDays.has(key)) {
            streak++;
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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {user?.name || 'User'}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                        {isTrainerView ? 'Keep your team consistent and progressing.' : 'Today’s focus, then log with speed.'}
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Today's Workout</CardTitle>
                        <CardDescription>
                            {isTrainerView
                                ? 'Your scheduled training for today'
                                : "Choose team → start workout → log sets → finish → review progress"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dataLoading ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">Loading today's training...</p>
                        ) : todaysWorkout ? (
                            <>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
                                    <p className="font-semibold text-slate-900 dark:text-white">{todaysWorkout.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {formatDateLabel(todaysWorkout.scheduledDate, {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link href={`/dashboard/log-workout/${todaysWorkout._id}`}>
                                        <Button className="w-full h-11">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            Quick Start
                                        </Button>
                                    </Link>
                                    <Link href={`/trainings/${todaysWorkout._id}`}>
                                        <Button variant="outline" className="w-full h-11">
                                            View Workout
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">No scheduled workout for today yet.</p>
                                <Link href="/trainings">
                                    <Button variant="outline">Browse Workout Plans</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-orange-600">
                                <Flame className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">Streak</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{streak}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">days in a row</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CalendarCheck className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">This week</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{workoutsThisWeek}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">workouts done</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm col-span-2">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-violet-600">
                                <Trophy className="w-4 h-4" />
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                            <div key={log._id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                                                <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                    {training?.title || 'Workout'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                            {(canManageTrainings || isTrainerView) && (
                                <Link href="/trainings/create" className="block">
                                    <Button className="w-full" variant="outline">Create Plan</Button>
                                </Link>
                            )}
                            <Link href="/trainings" className="block">
                                <Button className="w-full" variant="outline">Workout Plans</Button>
                            </Link>
                            <Link href="/dashboard/my-trainings" className="block">
                                <Button className="w-full" variant="outline">My Progress</Button>
                            </Link>
                            <Link href="/teams" className="block">
                                <Button className="w-full" variant="outline">Team</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Activity Trends</CardTitle>
                        <CardDescription>
                            {isTrainerView ? "Your team's training activity by day" : 'Your workout logging activity by day'}
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
