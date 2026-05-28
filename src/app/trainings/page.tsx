'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlanCard } from '@/components/PlanCard';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Plan = {
    _id: string;
    title: string;
    description?: string;
    isPersonal?: boolean;
    trainingCount: number;
    createdBy?: string;
};

export default function TrainingsPage() {
    const { user, activeTeam } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const effectiveRole = activeTeam.role || user?.role || null;
    const [filter, setFilter] = useState<'all' | 'team' | 'personal'>('all');
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; planId: string; title: string }>({
        isOpen: false,
        planId: '',
        title: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans', { credentials: 'include' });
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load plans');
                }
                const data = await res.json();
                setPlans(data.plans || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load plans');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, [activeTeam.teamId]);

    const filteredPlans = plans.filter((plan) => {
        if (filter === 'all') return true;
        if (filter === 'personal') return plan.isPersonal === true;
        if (filter === 'team') return !plan.isPersonal;
        return true;
    });

    const handleEdit = (planId: string) => {
        router.push(`/plans/${planId}`);
    };

    const handleDeleteClick = (planId: string, title: string) => {
        setDeleteDialog({ isOpen: true, planId, title });
    };

    const handleConfirmDelete = async () => {
        const planId = deleteDialog.planId;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/plans/${planId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to delete plan');
            }
            setPlans((prev) => prev.filter((p) => p._id !== planId));
            setDeleteDialog({ isOpen: false, planId: '', title: '' });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete plan');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Workout Plans</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Plans composed of multiple training sessions</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        {(effectiveRole === 'trainer' || effectiveRole === 'coach') && (
                            <Link href="/trainings/create" className="sm:flex-none">
                                <Button size="lg" className="w-full sm:w-auto">Create Team Plan</Button>
                            </Link>
                        )}
                        {(effectiveRole === 'trainer' || effectiveRole === 'coach' || effectiveRole === 'member') && (
                            <Link href="/trainings/create?personal=true" className="sm:flex-none">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">Create Personal Plan</Button>
                            </Link>
                        )}
                        <Link href="/library" className="sm:flex-none">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">Workouts Library</Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
                        All
                    </Button>
                    <Button variant={filter === 'team' ? 'default' : 'outline'} onClick={() => setFilter('team')}>
                        Team
                    </Button>
                    <Button variant={filter === 'personal' ? 'default' : 'outline'} onClick={() => setFilter('personal')}>
                        Personal
                    </Button>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    {isLoading ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">Loading plans...</p>
                            </CardContent>
                        </Card>
                    ) : error ? (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center text-red-600">
                                <p className="text-lg">{error}</p>
                            </CardContent>
                        </Card>
                    ) : plans.length > 0 ? (
                        filteredPlans.length > 0 ? (
                            filteredPlans.map((plan) => (
                                <PlanCard
                                    key={plan._id}
                                    id={plan._id}
                                    title={plan.title}
                                    description={plan.description}
                                    trainingCount={plan.trainingCount}
                                    isPersonal={plan.isPersonal}
                                    canManage={effectiveRole === 'trainer' || effectiveRole === 'coach'}
                                    onEdit={() => handleEdit(plan._id)}
                                    onDelete={() => handleDeleteClick(plan._id, plan.title)}
                                />
                            ))
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="py-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No {filter} plans found</p>
                                    <p className="text-gray-400 dark:text-gray-500 mt-2">Try selecting a different filter</p>
                                </CardContent>
                            </Card>
                        )
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">No plans yet</p>
                                <p className="text-gray-400 mt-2">Create your first plan to get started</p>
                                {(effectiveRole === 'trainer' || effectiveRole === 'coach') && (
                                    <Link href="/trainings/create" className="mt-4 inline-block">
                                        <Button>Create Your First Plan</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
                if (!open) setDeleteDialog({ isOpen: false, planId: '', title: '' });
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Plan</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;<span className="font-semibold">{deleteDialog.title}</span>&quot;? All training sessions in this plan will also be deleted. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ isOpen: false, planId: '', title: '' })}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
