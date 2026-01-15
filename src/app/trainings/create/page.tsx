'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateTrainingForm } from '@/components/CreateTrainingForm';

export default function CreateTrainingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Replace with actual API call
            console.log('Creating training:', data);
            // const response = await fetch('/api/trainings', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(data),
            // });

            // if (!response.ok) throw new Error('Failed to create training');

            router.push('/trainings');
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <nav className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-indigo-600">💪 TeamTrainer</h1>
                        <div className="flex gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Link href="/trainings">
                                <Button variant="ghost">Trainings</Button>
                            </Link>
                            <Button variant="outline">Logout</Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link href="/trainings" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
                        ← Back to Trainings
                    </Link>

                    <CreateTrainingForm
                        teamId="1"
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
}
