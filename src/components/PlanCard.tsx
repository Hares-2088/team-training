'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlanCardProps {
  id: string;
  title: string;
  description?: string;
  workoutCount: number;
  isPersonal?: boolean;
  canManage?: boolean;
  generationSource?: 'manual' | 'ai' | 'ai-fallback';
  goalSummary?: string;
  assigneeName?: string;
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
  generationSource = 'manual',
  goalSummary,
  assigneeName,
  onEdit,
  onDelete,
}: Readonly<PlanCardProps>) {
  const isAIPlan = generationSource !== 'manual';

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              {isPersonal && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Personal
                </span>
              )}
              {isAIPlan && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  AI Generated
                </span>
              )}
            </div>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
            {goalSummary && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Goal: {goalSummary}</p>
            )}
            {assigneeName && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Assigned to {assigneeName}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            🏋️ {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
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
