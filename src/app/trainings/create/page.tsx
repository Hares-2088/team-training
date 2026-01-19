'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import CreateTrainingPageContent from './create-content';

export default function CreateTrainingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="workouts" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-2xl mx-auto">
                    <Link href="/dashboard" className="inline-flex mb-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <Suspense fallback={<div>Loading...</div>}>
                        <CreateTrainingPageContent />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
