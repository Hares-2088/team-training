'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PlanCard } from '@/components/PlanCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

type Plan = {
  _id: string;
  title: string;
  description?: string;
  isPersonal?: boolean;
  workoutCount: number;
  createdBy?: string;
  generationSource?: 'manual' | 'ai' | 'ai-fallback';
  goalSummary?: string;
  assignee?: { _id: string; name: string; email: string } | null;
};

type PlanApiResponse = Plan & {
  trainingCount?: number;
};

type DeleteDialogState = {
  isOpen: boolean;
  planId: string;
  title: string;
};

export default function TrainingsPage() {
  const { user, activeTeam } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const effectiveRole = activeTeam.role || user?.role || null;
  const canManagePlans = effectiveRole === 'trainer' || effectiveRole === 'coach';
  const [filter, setFilter] = useState<'all' | 'team' | 'personal'>('all');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
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
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || 'Failed to load plans');
        }
        const data = (await res.json()) as { plans?: PlanApiResponse[] };
        const normalizedPlans: Plan[] = (data.plans || []).map((plan) => ({
          ...plan,
          workoutCount: Number(plan.trainingCount ?? plan.workoutCount ?? 0),
        }));
        setPlans(normalizedPlans);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load plans');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlans();
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
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to delete plan');
      }
      setPlans((prev) => prev.filter((plan) => plan._id !== planId));
      setDeleteDialog({ isOpen: false, planId: '', title: '' });
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="workouts" />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Workout Plans</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Plans composed of multiple workouts, including AI-generated programs.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {canManagePlans && (
              <Link href="/trainings/ai" className="sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto">
                  Generate AI Training
                </Button>
              </Link>
            )}
            {canManagePlans && (
              <Link href="/trainings/create" className="sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Team Plan
                </Button>
              </Link>
            )}
            {(canManagePlans || effectiveRole === 'member') && (
              <Link href="/trainings/create?personal=true" className="sm:flex-none">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Personal Plan
                </Button>
              </Link>
            )}
            <Link href="/library" className="sm:flex-none">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Workouts Library
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'team' ? 'default' : 'outline'} onClick={() => setFilter('team')}>
            Team
          </Button>
          <Button
            variant={filter === 'personal' ? 'default' : 'outline'}
            onClick={() => setFilter('personal')}
          >
            Personal
          </Button>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6">
          {isLoading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-500">Loading plans...</p>
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
                  workoutCount={plan.workoutCount}
                  isPersonal={plan.isPersonal}
                  generationSource={plan.generationSource}
                  goalSummary={plan.goalSummary}
                  assigneeName={plan.assignee?.name}
                  canManage={canManagePlans}
                  onEdit={() => handleEdit(plan._id)}
                  onDelete={() => handleDeleteClick(plan._id, plan.title)}
                />
              ))
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <p className="text-lg text-gray-500 dark:text-gray-400">No {filter} plans found</p>
                  <p className="mt-2 text-gray-400 dark:text-gray-500">Try selecting a different filter.</p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-500">No plans yet</p>
                <p className="mt-2 text-gray-400">Create or generate your first plan to get started.</p>
                <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                  {canManagePlans && (
                    <Link href="/trainings/ai" className="inline-block">
                      <Button>Generate AI Plan</Button>
                    </Link>
                  )}
                  <Link href="/trainings/create" className="inline-block">
                    <Button variant="outline">Create Plan Manually</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteDialog({ isOpen: false, planId: '', title: '' });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              <span className="font-semibold">{deleteDialog.title}</span>
              &quot;? All workouts in this plan will also be deleted. This action cannot be undone.
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
