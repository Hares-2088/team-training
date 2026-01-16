'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ChevronLeft } from 'lucide-react';

type Team = {
    _id: string;
    name: string;
    description?: string;
};

export default function EditTeamPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await fetch(`/api/teams/${id}`);
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load team');
                }

                const data = await res.json();
                setTeam(data.team);
                setFormData({
                    name: data.team.name,
                    description: data.team.description || '',
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load team';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/teams/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to update team');
            }

            router.push(`/teams/${id}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update team';
            console.error('Error:', message);
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href={`/teams/${id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                            <ChevronLeft className="w-4 h-4 transition-transform" />
                            Back to Team
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-slate-600 dark:text-slate-400">Loading team...</div>
                </main>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/teams" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                            <ChevronLeft className="w-4 h-4 transition-transform" />
                            Back to Teams
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="card-base border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950">
                        <CardContent className="py-8 text-center text-danger-700 dark:text-danger-200">
                            {error || 'Team not found'}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href={`/teams/${id}`} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        Back to Team
                    </Link>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Edit Team</h1>
                    <p className="text-slate-600 dark:text-slate-400">Update the team details below</p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-4 py-3 text-sm text-danger-700 dark:text-danger-200">
                        {error}
                    </div>
                )}

                <Card className="card-base">
                    <CardHeader>
                        <CardTitle>Team Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                                    Team Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter team name"
                                    required
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                                    Description
                                </Label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter team description (optional)"
                                    className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/teams/${id}`)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
