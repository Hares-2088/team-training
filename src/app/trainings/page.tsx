'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingCard } from '@/components/TrainingCard';

export default function TrainingsPage() {
    // Placeholder data - will be replaced with actual data
    const trainings = [
        {
            id: '1',
            title: 'Upper Body Strength',
            description: 'Focus on chest, back, and shoulders',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            exerciseCount: 4,
            status: 'scheduled' as const,
        },
        {
            id: '2',
            title: 'Lower Body Power',
            description: 'Legs and glutes workout',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            exerciseCount: 5,
            status: 'scheduled' as const,
        },
    ];

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
                            <Button variant="outline">Logout</Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Trainings</h2>
                        <p className="text-gray-600 mt-1">View and manage your team workouts</p>
                    </div>
                    <Link href="/trainings/create">
                        <Button size="lg">Create Training</Button>
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button variant="default">All</Button>
                    <Button variant="outline">Scheduled</Button>
                    <Button variant="outline">Completed</Button>
                </div>

                {/* Trainings Grid */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    {trainings.length > 0 ? (
                        trainings.map((training) => (
                            <TrainingCard
                                key={training.id}
                                id={training.id}
                                title={training.title}
                                description={training.description}
                                date={training.date.toISOString()}
                                exerciseCount={training.exerciseCount}
                                status={training.status}
                            />
                        ))
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">No trainings yet</p>
                                <p className="text-gray-400 mt-2">Create your first training to get started</p>
                                <Link href="/trainings/create" className="mt-4 inline-block">
                                    <Button>Create Your First Training</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
