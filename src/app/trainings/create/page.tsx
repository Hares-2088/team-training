'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTrainingForm } from '@/components/CreateTrainingForm';
import { Navbar } from '@/components/Navbar';

export default function CreateTrainingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => router.push('/dashboard')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all text-sm mb-4 inline-flex items-center gap-1 hover:-translate-x-0.5">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        Back to Dashboard
                    </button>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <CreateTrainingForm
                        defaultTeamId=""
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
}
