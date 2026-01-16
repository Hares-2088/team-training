'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { ChevronLeft, Activity } from 'lucide-react';

interface WorkoutLog {
    id: string;
    date: string;
    trainingTitle: string;
}

interface MemberData {
    _id: string;
    name: string;
    email: string;
}

export default function MemberLogsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id as string;
    const memberId = params.memberId as string;

    const [member, setMember] = useState<MemberData | null>(null);
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMemberLogs = async () => {
            try {
                const res = await fetch(`/api/teams/${teamId}/members/${memberId}/logs`, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to fetch member logs');
                }

                const data = await res.json();
                setMember(data.member);
                setLogs(data.logs);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch member logs';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMemberLogs();
    }, [teamId, memberId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="teams" />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center py-8 text-slate-500">Loading member logs...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Navbar currentPage="teams" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5 mb-6"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform" />
                    Back
                </button>

                {error ? (
                    <Card className="border-red-200 dark:border-red-800">
                        <CardContent className="pt-6">
                            <p className="text-red-500">{error}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Member Info Card */}
                        <Card className="shadow-lg mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold text-lg">
                                        {member?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{member?.name}</CardTitle>
                                        <CardDescription>{member?.email}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Logs Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                Training Logs ({logs.length})
                            </h2>

                            {logs.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No training logs recorded yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <Card
                                            key={log.id}
                                            className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer hover:border-primary-400 dark:hover:border-primary-600"
                                            onClick={() => router.push(`/dashboard/my-trainings/${log.id}`)}
                                        >
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 flex items-center justify-center">
                                                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                                {log.trainingTitle}
                                                            </p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {format(
                                                                    new Date(log.date),
                                                                    'EEEE, MMMM d, yyyy • h:mm a'
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">Completed</Badge>
                                                        <ChevronLeft className="w-5 h-5 text-slate-400 dark:text-slate-600 rotate-180" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
