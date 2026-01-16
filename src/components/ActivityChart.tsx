'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ActivityData =
    | Array<{ date: string; workouts: number }>
    | Array<{ date: string;[key: string]: string | number }>;

export function ActivityChart({ isTrainer }: { isTrainer: boolean }) {
    const [data, setData] = useState<ActivityData>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/activity', { credentials: 'include' });

                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to fetch activity');
                }

                const { activity } = await res.json();
                setData(activity);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch activity';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (isLoading) {
        return <div className="text-center py-8 text-slate-500">Loading activity data...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>No activity recorded yet</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            {isTrainer ? (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis label={{ value: 'Members Trained', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {data.length > 0 &&
                        Object.keys(data[0])
                            .filter((key) => key !== 'date')
                            .map((team, index) => (
                                <Bar
                                    key={team}
                                    dataKey={team}
                                    fill={`hsl(${(index * 360) / 5}, 70%, 60%)`}
                                    name={team}
                                />
                            ))}
                </BarChart>
            ) : (
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis label={{ value: 'Workouts Logged', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="workouts"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Workouts"
                    />
                </LineChart>
            )}
        </ResponsiveContainer>
    );
}
