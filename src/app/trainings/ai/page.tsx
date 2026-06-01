'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { GenerateAITrainingForm } from '@/components/GenerateAITrainingForm';

export default function GenerateAITrainingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="workouts" />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/trainings" className="inline-flex mb-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Workout Plans
            </Button>
          </Link>

          <GenerateAITrainingForm onSuccess={(planId) => router.push(`/plans/${planId}`)} />
        </div>
      </main>
    </div>
  );
}
