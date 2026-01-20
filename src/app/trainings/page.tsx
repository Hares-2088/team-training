'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TrainingCard } from '@/components/TrainingCard';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Training = {
    _id: string;
    title: string;
    description?: string;
    scheduledDate: string;
    exercises?: { name: string }[];
    status: 'scheduled' | 'completed' | 'cancelled';
    team?: string;
    allMembersCompleted?: boolean;
};

type WorkoutLog = {
    _id: string;
    training: string | { _id: string };
    member: string;
};

type Team = {
    _id: string;
    members: Array<{ _id: string }> | string[];
};

export default function TrainingsPage() {
    const { user, activeTeam } = useAuth();
    const router = useRouter();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const effectiveRole = activeTeam.role || user?.role || null;
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; trainingId: string; title: string }>({
        isOpen: false,
        trainingId: '',
        title: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const trainingsRes = await fetch('/api/trainings', { credentials: 'include' });

                if (!trainingsRes.ok) {
                    const payload = await trainingsRes.json();
                    throw new Error(payload.error || 'Failed to load trainings');
                }

                const trainingsData = await trainingsRes.json();
                const loadedTrainings = trainingsData.trainings || [];

                // For trainers/coaches: check if all members completed each training
                if (effectiveRole === 'trainer' || effectiveRole === 'coach') {
                    // Fetch active team data to know member count
                    const teamRes = await fetch(`/api/teams/${activeTeam.teamId}`, { credentials: 'include' });
                    if (teamRes.ok) {
                        const teamData = await teamRes.json();
                        const team: Team = teamData.team;
                        const memberCount = team.members?.length || 0;

                        // For each training, fetch logs and check completion
                        const trainingsWithCompletion = await Promise.all(
                            loadedTrainings.map(async (training: Training) => {
                                const logsRes = await fetch(`/api/trainings/${training._id}/logs`, { credentials: 'include' });
                                if (logsRes.ok) {
                                    const logsData = await logsRes.json();
                                    const logs = logsData.logs || [];
                                    // Count unique members who logged this training
                                    const uniqueMembers = new Set(logs.map((log: WorkoutLog) => log.member));
                                    const allMembersCompleted = memberCount > 0 && uniqueMembers.size >= memberCount;
                                    return { ...training, allMembersCompleted };
                                }
                                return { ...training, allMembersCompleted: false };
                            })
                        );
                        setTrainings(trainingsWithCompletion);
                    } else {
                        setTrainings(loadedTrainings);
                    }
                } else {
                    // For members: fetch their logs
                    const workoutLogsRes = await fetch('/api/workout-logs', { credentials: 'include' });
                    const workoutLogsData = workoutLogsRes.ok ? await workoutLogsRes.json() : [];

                    const completedTrainingIds = new Set(
                        workoutLogsData
                            .filter((log: WorkoutLog) => log.training)
                            .map((log: WorkoutLog) => typeof log.training === 'string' ? log.training : log.training._id)
                    );

                    const trainingsWithStatus = loadedTrainings.map((training: Training) => ({
                        ...training,
                        allMembersCompleted: completedTrainingIds.has(training._id),
                    }));

                    setTrainings(trainingsWithStatus);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load trainings';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [effectiveRole, activeTeam.teamId]);

    const filteredTrainings = trainings.filter((training) => {
        if (filter === 'all') return true;

        // Determine if training is completed
        const isCompleted = training.allMembersCompleted;

        if (filter === 'completed') return isCompleted;
        if (filter === 'scheduled') return !isCompleted;
        return training.status === filter;
    });

    const handleEdit = (trainingId: string) => {
        router.push(`/trainings/${trainingId}/edit`);
    };

    const handleDeleteClick = (trainingId: string, title: string) => {
        setDeleteDialog({ isOpen: true, trainingId, title });
    };

    const handleConfirmDelete = async () => {
        const trainingId = deleteDialog.trainingId;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/trainings/${trainingId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete training');
            }

            // Remove from local state
            setTrainings((prev) => prev.filter((t) => t._id !== trainingId));
            setDeleteDialog({ isOpen: false, trainingId: '', title: '' });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete training');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Workout Plans</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage your team workouts</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        {(effectiveRole === 'trainer' || effectiveRole === 'coach') && (
                            <Link href="/trainings/create" className="sm:flex-none">
                                <Button size="lg" className="w-full sm:w-auto">Create Training</Button>
                            </Link>
                        )}
                        <Link href="/library" className="sm:flex-none">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">Workouts Library</Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'scheduled' ? 'default' : 'outline'}
                        onClick={() => setFilter('scheduled')}
                    >
                        Scheduled
                    </Button>
                    <Button
                        variant={filter === 'completed' ? 'default' : 'outline'}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </Button>
                </div>

                {/* Trainings Grid */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    {isLoading ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">Loading trainings...</p>
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center text-red-600">
                                <p className="text-lg">{error}</p>
                            </CardContent>
                        </Card>
                    ) : trainings.length > 0 ? (
                        filteredTrainings.length > 0 ? (
                            filteredTrainings.map((training) => (
                                <TrainingCard
                                    key={training._id}
                                    id={training._id}
                                    title={training.title}
                                    description={training.description || ''}
                                    date={training.scheduledDate}
                                    exerciseCount={training.exercises?.length || 0}
                                    status={training.status}
                                    userCompleted={training.allMembersCompleted || false}
                                    canManageTrainings={effectiveRole === 'trainer' || effectiveRole === 'coach'}
                                    onEdit={() => handleEdit(training._id)}
                                    onDelete={() => handleDeleteClick(training._id, training.title)}
                                />
                            ))
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No {filter} trainings found</p>
                                    <p className="text-gray-400 dark:text-gray-500 mt-2">Try selecting a different filter</p>
                                </CardContent>
                            </Card>
                        )
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">No trainings yet</p>
                                <p className="text-gray-400 mt-2">Create your first training to get started</p>
                                {(effectiveRole === 'trainer' || effectiveRole === 'coach') && (
                                    <Link href="/trainings/create" className="mt-4 inline-block">
                                        <Button>Create Your First Training</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
                if (!open) setDeleteDialog({ isOpen: false, trainingId: '', title: '' });
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Training</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "<span className="font-semibold">{deleteDialog.title}</span>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ isOpen: false, trainingId: '', title: '' })}
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
