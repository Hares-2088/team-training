'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateTrainingForm } from '@/components/CreateTrainingForm';

export default function CreateTrainingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
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

            const response = await fetch('/api/trainings', {
                method: 'POST',
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
                throw new Error(payload.error || 'Failed to create training');
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
