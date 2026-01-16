'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditTrainingForm } from '@/components/EditTrainingForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronLeft } from 'lucide-react';

type Training = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restTime: number;
        notes?: string;
    }>;
    status: 'scheduled' | 'completed' | 'cancelled';
    team?: { _id: string; name: string };
};

export default function EditTrainingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [training, setTraining] = useState<Training | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTraining = async () => {
            try {
                const res = await fetch(`/api/trainings/${id}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load training');
                }

                const data = await res.json();
                setTraining(data.training);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load training';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTraining();
    }, [id]);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`/api/trainings/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    scheduledDate: data.scheduledDate,
                    exercises: data.exercises,
                    team: data.teamId,
                }),
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to update training');
            }

            router.push(`/trainings/${id}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update training';
            console.error('Error:', message);
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href={`/trainings/${id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                            <ChevronLeft className="w-4 h-4 transition-transform" />
                            Back to Training
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-slate-600 dark:text-slate-400">Loading training...</div>
                </main>
            </div>
        );
    }

    if (error || !training) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/trainings" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                            <ChevronLeft className="w-4 h-4 transition-transform" />
                            Back to Trainings
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="card-base border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950">
                        <CardContent className="py-8 text-center text-danger-700 dark:text-danger-200">
                            {error || 'Training not found'}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href={`/trainings/${id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        Back to Training
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Edit Training</h1>
                    <p className="text-slate-600 dark:text-slate-400">Update the training details below</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-4 py-3 text-sm text-danger-700 dark:text-danger-200">
                        {error}
                    </div>
                )}

                <EditTrainingForm
                    initialData={{
                        title: training.title,
                        description: training.description || '',
                        scheduledDate: new Date(training.scheduledDate).toISOString().split('T')[0],
                        exercises: training.exercises.map(ex => ({ ...ex, notes: ex.notes || '' })),
                        teamId: training.team?._id || '',
                    }}
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                />
            </main>
        </div>
    );
}
