'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateTrainingForm } from '@/components/CreateTrainingForm';

export default function CreateTrainingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isPersonal = searchParams.get('personal') === 'true';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prefill, setPrefill] = useState<{ title?: string; description?: string; exercises?: any[] } | null>(null);

    useEffect(() => {
        const templateId = searchParams.get('templateId');
        const loadTemplate = async () => {
            if (!templateId) return;
            try {
                const res = await fetch(`/api/workout-templates/${templateId}`);
                if (!res.ok) return;
                const { template } = await res.json();
                setPrefill({
                    title: template.title,
                    description: template.description,
                    exercises: template.exercises || [],
                });
            } catch {
                // ignore
            }
        };
        loadTemplate();
    }, [searchParams]);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!data.teamId) {
                throw new Error('Team is required');
            }
            if (!data.scheduledDates || data.scheduledDates.length === 0) {
                throw new Error('At least one date is required');
            }

            // Create a training for each selected date
            const createdTrainings = [];
            for (const scheduledDate of data.scheduledDates) {
                const response = await fetch('/api/trainings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: data.title,
                        description: data.description,
                        scheduledDate: scheduledDate,
                        exercises: data.exercises,
                        team: data.teamId,
                        isPersonal: isPersonal,
                    }),
                });

                if (!response.ok) {
                    const payload = await response.json();
                    throw new Error(payload.error || `Failed to create training for ${scheduledDate}`);
                }

                const result = await response.json();
                createdTrainings.push(result);
            }

            router.push('/trainings');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create training';
            console.error('Error:', message);
            setError(message);
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
                    {isPersonal ? 'Create Personal Training' : 'Create Team Training'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {isPersonal
                        ? 'Create a personal training for yourself. Only you can see this training.'
                        : 'Create a training for your team. All team members will see this.'}
                </p>
            </div>

            <CreateTrainingForm
                defaultTeamId=""
                initialTitle={prefill?.title || ''}
                initialDescription={prefill?.description || ''}
                initialExercises={prefill?.exercises || []}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </>
    );
}
