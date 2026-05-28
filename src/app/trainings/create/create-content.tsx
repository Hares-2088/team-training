'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreatePlanForm } from '@/components/CreatePlanForm';

export default function CreateTrainingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isPersonal = searchParams.get('personal') === 'true';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: {
        title: string;
        description: string;
        teamId: string;
        isPersonal: boolean;
        sessions: Array<{
            title: string;
            scheduledDate: string;
            exercises: Array<{ name: string; sets: number; reps: string; restTime: number; notes: string }>;
        }>;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!data.teamId) throw new Error('Team is required');
            if (!data.sessions || data.sessions.length === 0) throw new Error('At least one training session is required');

            // 1. Create the plan
            const planRes = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    team: data.teamId,
                    isPersonal: data.isPersonal,
                }),
            });
            if (!planRes.ok) {
                const payload = await planRes.json();
                throw new Error(payload.error || 'Failed to create plan');
            }
            const { plan } = await planRes.json();

            // 2. Create a training for each session
            for (const session of data.sessions) {
                const trainingRes = await fetch('/api/trainings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: session.title,
                        scheduledDate: session.scheduledDate,
                        exercises: session.exercises,
                        team: data.teamId,
                        isPersonal: data.isPersonal,
                        planId: plan._id,
                    }),
                });
                if (!trainingRes.ok) {
                    const payload = await trainingRes.json();
                    throw new Error(payload.error || `Failed to create training session "${session.title}"`);
                }
            }

            router.push(`/plans/${plan._id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create plan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isPersonal ? 'Create Personal Plan' : 'Create Team Plan'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {isPersonal
                        ? 'Create a personal plan with one or more training sessions. Only you can see this plan.'
                        : 'Create a team plan composed of multiple training sessions. Team members will see this plan.'}
                </p>
            </div>

            <CreatePlanForm
                isPersonal={isPersonal}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </>
    );
}
