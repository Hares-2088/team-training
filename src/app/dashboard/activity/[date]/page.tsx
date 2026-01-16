'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Member {
    memberId: string;
    memberName: string;
    team: string;
    trainings: string[];
}

export default function ActivityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const date = params.date as string;
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivityDetails = async () => {
            try {
                const res = await fetch(`/api/activity/${date}`, {
                    credentials: 'include',
                });

                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to fetch activity details');
                }

                const data = await res.json();
                setMembers(data.members);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch activity details';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivityDetails();
    }, [date]);

    const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-8 text-slate-500">Loading activity details...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="mb-4"
                    >
                        ← Back
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {formattedDate}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {members.length} member{members.length !== 1 ? 's' : ''} trained
                    </p>
                </div>

                {error ? (
                    <Card className="border-red-200 dark:border-red-800">
                        <CardContent className="pt-6">
                            <p className="text-red-500">{error}</p>
                        </CardContent>
                    </Card>
                ) : members.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
                                No members trained on this date
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {members.map((member) => (
                            <Card
                                key={member.memberId}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">
                                                {member.memberName}
                                            </CardTitle>
                                            <CardDescription>
                                                <Badge variant="outline" className="mt-2">
                                                    {member.team}
                                                </Badge>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                                            Trainings Completed:
                                        </h3>
                                        <ul className="space-y-2">
                                            {member.trainings.map((training, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                                >
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    {training}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
