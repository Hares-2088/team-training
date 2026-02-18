'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';

type Exercise = {
    exerciseName: string;
    setNumber: number;
    weight: number;
    weightUnit?: 'lbs' | 'kg' | 'bodyweight';
    reps: number;
    rpe?: number;
    notes?: string;
};

type WorkoutLog = {
    _id: string;
    training: {
        _id: string;
        title: string;
        scheduledDate: string;
    };
    member: {
        _id: string;
        name: string;
    };
    exercises: Exercise[];
    completedAt: string;
    notes?: string;
};

type ExerciseGroup = {
    name: string;
    sets: Exercise[];
};

export default function WorkoutDetailPage({
    params,
}: {
    params: Promise<{ logId: string }>;
}) {
    const router = useRouter();
    const [logId, setLogId] = useState<string>('');
    const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadParams = async () => {
            const resolvedParams = await Promise.resolve(params);
            setLogId(resolvedParams.logId);
        };
        loadParams();
    }, [params]);

    useEffect(() => {
        if (logId) {
            fetchWorkoutLog();
        }
    }, [logId]);

    const fetchWorkoutLog = async () => {
        try {
            const response = await fetch('/api/workout-logs');
            if (response.ok) {
                const allLogs = await response.json();
                const log = allLogs.find((l: WorkoutLog) => l._id === logId);
                setWorkoutLog(log || null);
            }
        } catch (error) {
            console.error('Error fetching workout log:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const groupExercises = (exercises: Exercise[]): ExerciseGroup[] => {
        const groups: { [key: string]: Exercise[] } = {};

        exercises.forEach((exercise) => {
            if (!groups[exercise.exerciseName]) {
                groups[exercise.exerciseName] = [];
            }
            groups[exercise.exerciseName].push(exercise);
        });

        return Object.entries(groups).map(([name, sets]) => ({
            name,
            sets: sets.sort((a, b) => a.setNumber - b.setNumber),
        }));
    };

    const getTotalVolume = (exercises: Exercise[]) => {
        return exercises.reduce((total, ex) => {
            // Don't count bodyweight exercises in volume calculation
            if (ex.weightUnit === 'bodyweight') return total;
            return total + (ex.weight * ex.reps);
        }, 0);
    };

    const getAverageRPE = (exercises: Exercise[]) => {
        const exercisesWithRPE = exercises.filter((ex) => ex.rpe !== undefined);
        if (exercisesWithRPE.length === 0) return 0;
        const sum = exercisesWithRPE.reduce((total, ex) => total + (ex.rpe || 0), 0);
        return (sum / exercisesWithRPE.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <Navbar currentPage="dashboard" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400">Loading workout details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!workoutLog) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <Navbar currentPage="dashboard" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-12 text-center">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Workout log not found
                            </p>
                            <Link href="/dashboard/my-trainings">
                                <Button>Back to My Workout Stats</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const exerciseGroups = groupExercises(workoutLog.exercises);
    const totalVolume = getTotalVolume(workoutLog.exercises);
    const averageRPE = getAverageRPE(workoutLog.exercises);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <Link href="/dashboard/my-trainings">
                    <Button variant="ghost" className="mb-6">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to My Workout Stats
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                {workoutLog.training.title}
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                {formatDate(workoutLog.completedAt)}
                            </p>
                        </div>
                        <Badge className="bg-green-500 text-white hover:bg-green-600">
                            Completed
                        </Badge>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-lg dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {exerciseGroups.length}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Exercises
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {workoutLog.exercises.length}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Total Sets
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {totalVolume.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Total Volume
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                {averageRPE}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Avg RPE
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Workout Notes */}
                {workoutLog.notes && (
                    <Card className="border-0 shadow-lg dark:bg-slate-900 mb-8">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white">Workout Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 dark:text-slate-400">{workoutLog.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Exercise Details */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exercise Details</h2>
                    {exerciseGroups.map((group, index) => (
                        <Card key={index} className="border-0 shadow-lg dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                    {group.name}
                                </CardTitle>
                                <CardDescription className="dark:text-slate-400">
                                    {group.sets.length} {group.sets.length === 1 ? 'set' : 'sets'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Set
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Weight
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Reps
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    RPE
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Volume
                                                </th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Notes
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.sets.map((set, setIndex) => (
                                                <tr
                                                    key={setIndex}
                                                    className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                                                >
                                                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                                                        {set.setNumber}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                                                        {set.weightUnit === 'bodyweight' ? 'Bodyweight' : `${set.weight}${set.weightUnit || 'lbs'}`}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                                                        {set.reps}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                                                        {set.rpe || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                                                        {set.weightUnit === 'bodyweight' ? '-' : (set.weight * set.reps).toFixed(1)}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                                                        {set.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                    <Link href="/dashboard/my-trainings" className="flex-1">
                        <Button variant="outline" className="w-full">
                            Back to My Workout Stats
                        </Button>
                    </Link>
                    <Link href="/trainings" className="flex-1">
                        <Button className="w-full">
                            View Workout Plans
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
