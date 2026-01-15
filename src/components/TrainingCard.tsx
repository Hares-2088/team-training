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
    onDelete?: () => void;
    onEdit?: () => void;
    isTrainer?: boolean;
}

export function TrainingCard({
    id,
    title,
    description,
    date,
    exerciseCount,
    status,
    onDelete,
    onEdit,
    isTrainer = false,
}: TrainingCardProps) {
    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>📅 {new Date(date).toLocaleDateString()}</span>
                        <span>💪 {exerciseCount} exercises</span>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/trainings/${id}`} className="flex-1">
                            <Button className="w-full" variant="default">
                                View Details
                            </Button>
                        </Link>
                        {isTrainer && (
                            <>
                                <Button onClick={onEdit} variant="outline">
                                    Edit
                                </Button>
                                <Button onClick={onDelete} variant="destructive">
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
