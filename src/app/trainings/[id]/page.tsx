'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronLeft, Edit, Trash2, Calendar, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Training = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    exercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restTime?: number;
        notes?: string;
    }>;
    status: 'scheduled' | 'completed' | 'cancelled';
    trainer?: { _id: string; name: string; email: string };
    team?: { _id: string; name: string };
};

export default function TrainingDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [training, setTraining] = useState<Training | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchTraining = async () => {
            try {
                const res = await fetch(`/api/trainings/${id}`);
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="badge-success">Completed</Badge>;
            case 'scheduled':
                return <Badge className="badge-warning">Scheduled</Badge>;
            case 'cancelled':
                return <Badge className="badge-danger">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/trainings/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete training');
            }

            router.push('/trainings');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete training';
            setError(message);
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <nav className="nav-header">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/trainings" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                            <ChevronLeft className="w-4 h-4 transition-transform" />
                            Back to Workout Plans
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-slate-600 dark:text-slate-400">Loading training details...</div>
                </main>
            </div>
        );
    }

    if (error || !training) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <nav className="nav-header">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/trainings" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" />
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Navigation Header */}
            <nav className="nav-header">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/trainings" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        Back to Workout Plans
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Card */}
                <Card className="card-base shadow-lg mb-8">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-3xl mb-2">{training.title}</CardTitle>
                                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                                    {training.description || 'No description provided'}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge(training.status)}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Training Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    <p className="text-label">Scheduled Date & Time</p>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 ml-8">{formatDate(training.scheduledDate)}</p>
                            </div>

                            {training.team && (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Dumbbell className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                        <p className="text-label">Team</p>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 ml-8">{training.team.name}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {(user?.role === 'trainer' || user?.role === 'coach') && (
                            <div className="flex gap-3">
                                <Link href={`/trainings/${id}/edit`} className="flex-1">
                                    <Button className="btn-primary w-full">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Training
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Exercises Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        Exercises ({training.exercises.length})
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {training.exercises.length > 0 ? (
                            training.exercises.map((exercise, index) => (
                                <Card key={index} className="card-base hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div>
                                                <p className="text-label text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                    Exercise
                                                </p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-white">{exercise.name}</p>
                                            </div>

                                            <div>
                                                <p className="text-label text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                    Sets
                                                </p>
                                                <p className="text-lg font-semibold text-accent-600 dark:text-accent-400">{exercise.sets}</p>
                                            </div>

                                            <div>
                                                <p className="text-label text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                    Reps
                                                </p>
                                                <p className="text-lg font-semibold text-accent-600 dark:text-accent-400">{exercise.reps}</p>
                                            </div>

                                            <div>
                                                <p className="text-label text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                    Rest Time
                                                </p>
                                                <p className="text-lg font-semibold text-accent-600 dark:text-accent-400">{exercise.restTime || 90}s</p>
                                            </div>

                                            {exercise.notes && (
                                                <div>
                                                    <p className="text-label text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                                                        Notes
                                                    </p>
                                                    <p className="text-slate-700 dark:text-slate-300">{exercise.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="card-base">
                                <CardContent className="py-8 text-center text-muted">No exercises added yet</CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Training</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "<span className="font-semibold">{training?.title}</span>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
