'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface TrainingCardProps {
    id: string;
    title: string;
    description?: string;
    date: string;
    exerciseCount: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    userCompleted?: boolean; // User-specific completion status
    onDelete?: () => void;
    onEdit?: () => void;
    canManageTrainings?: boolean;
}

export function TrainingCard({
    id,
    title,
    description,
    date,
    exerciseCount,
    status,
    userCompleted = false,
    onDelete,
    onEdit,
    canManageTrainings = false,
}: Readonly<TrainingCardProps>) {
    // Use userCompleted for display status if provided
    const displayStatus = userCompleted ? 'completed' : 'scheduled';

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[displayStatus]}`}>
                        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>📅 {new Date(date).toLocaleDateString()}</span>
                        <span>💪 {exerciseCount} exercises</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/trainings/${id}`} className="flex-1">
                            <Button className="w-full" variant="default">
                                View Details
                            </Button>
                        </Link>
                        {!userCompleted && (
                            <Link href={`/dashboard/log-workout/${id}`} className="sm:flex-none w-full sm:w-auto">
                                <Button className="w-full" variant="outline">Log Workout</Button>
                            </Link>
                        )}
                        {canManageTrainings && (
                            <div className="flex gap-2 sm:contents">
                                <Button onClick={onEdit} variant="outline" className="flex-1 sm:flex-none">
                                    Edit
                                </Button>
                                <Button onClick={onDelete} variant="destructive" className="flex-1 sm:flex-none">
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
