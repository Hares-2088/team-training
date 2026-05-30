'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface PlanCardProps {
    id: string;
    title: string;
    description?: string;
    workoutCount: number;
    isPersonal?: boolean;
    canManage?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function PlanCard({
    id,
    title,
    description,
    workoutCount,
    isPersonal,
    canManage = false,
    onEdit,
    onDelete,
}: Readonly<PlanCardProps>) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {isPersonal && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    Personal
                                </span>
                            )}
                        </div>
                        {description && (
                            <CardDescription className="mt-1">{description}</CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        🏋️ {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/plans/${id}`} className="flex-1">
                            <Button className="w-full" variant="default">
                                View Plan
                            </Button>
                        </Link>
                        {canManage && (
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
