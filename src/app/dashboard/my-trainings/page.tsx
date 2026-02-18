'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    exercises: Array<{
        exerciseName: string;
        setNumber: number;
        weight: number;
        weightUnit?: 'lbs' | 'kg' | 'bodyweight';
        reps: number;
        rpe?: number;
        notes?: string;
    }>;
    completedAt: string;
    notes?: string;
};

export default function MyTrainingsPage() {
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkoutLogs();
    }, []);

    const fetchWorkoutLogs = async () => {
        try {
            const response = await fetch('/api/workout-logs');
            if (response.ok) {
                const data = await response.json();
                setWorkoutLogs(data);
            }
        } catch (error) {
            console.error('Error fetching workout logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getUniqueExercises = (exercises: WorkoutLog['exercises']) => {
        const uniqueNames = new Set(exercises.map((ex) => ex.exerciseName));
        return Array.from(uniqueNames);
    };

    const getTotalSets = (exercises: WorkoutLog['exercises']) => {
        return exercises.length;
    };

    const getTotalVolume = (exercises: WorkoutLog['exercises']) => {
        return exercises.reduce((total, ex) => {
            // Don't count bodyweight exercises in volume calculation
            if (ex.weightUnit === 'bodyweight') return total;
            return total + (ex.weight * ex.reps);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Workout Stats</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        View your complete workout history
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600 dark:text-slate-400">Loading your workouts...</p>
                    </div>
                ) : workoutLogs.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="py-12 text-center">
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                No workout logs yet. Complete your first workout to see it here!
                            </p>
                            <Link href="/trainings">
                                <Button>View Workout Plans</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {workoutLogs.map((log) => {
                            // Skip logs where training has been deleted
                            if (!log.training) {
                                return null;
                            }

                            const uniqueExercises = getUniqueExercises(log.exercises);
                            const totalSets = getTotalSets(log.exercises);
                            const totalVolume = getTotalVolume(log.exercises);

                            return (
                                <Card
                                    key={log._id}
                                    className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-900"
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl mb-2 text-slate-900 dark:text-white">
                                                    {log.training.title}
                                                </CardTitle>
                                                <CardDescription className="dark:text-slate-400">
                                                    Completed {formatDate(log.completedAt)}
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-green-500 text-white hover:bg-green-600">
                                                Completed
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {uniqueExercises.length}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Exercises
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {totalSets}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Total Sets
                                                </p>
                                            </div>
                                            <div className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {totalVolume.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Total Volume (kg)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Exercises:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {uniqueExercises.map((exerciseName, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="dark:border-slate-600 dark:text-slate-300"
                                                    >
                                                        {exerciseName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {log.notes && (
                                            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Notes:
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {log.notes}
                                                </p>
                                            </div>
                                        )}

                                        <Link href={`/dashboard/my-trainings/${log._id}`}>
                                            <Button className="w-full" variant="outline">
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
