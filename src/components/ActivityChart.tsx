'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, differenceInDays, isToday, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ActivityData =
    | Array<{ date: string; workouts: number }>
    | Array<{ date: string;[key: string]: string | number }>;

type TrainingDay = {
    isCompleted: boolean;
    title?: string;
};

export function ActivityChart({ isTrainer }: { isTrainer: boolean }) {
    const router = useRouter();
    const [data, setData] = useState<ActivityData>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);
    const [month, setMonth] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    const [hoveredMemberCount, setHoveredMemberCount] = useState<number>(0);
    const [trainingDays, setTrainingDays] = useState<Map<string, TrainingDay>>(new Map());

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/activity', { credentials: 'include' });

                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to fetch activity');
                }

                const { activity } = await res.json();
                console.log('Activity data received:', activity, 'isTrainer:', isTrainer);
                setData(activity);

                // Calculate streak for members
                if (!isTrainer && Array.isArray(activity)) {
                    calculateStreak(activity);
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to fetch activity';
                console.error('Activity fetch error:', message);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchTrainingData = async () => {
            // Only fetch training data for members
            if (isTrainer) return;

            try {
                // Fetch trainings
                const trainingsRes = await fetch('/api/trainings');
                if (!trainingsRes.ok) throw new Error('Failed to fetch trainings');
                const { trainings } = await trainingsRes.json();

                // Fetch workout logs to check completions
                const logsRes = await fetch('/api/workout-logs');
                if (!logsRes.ok) throw new Error('Failed to fetch workout logs');
                const workoutLogs = await logsRes.json();

                // Create map of completed training IDs
                const completedTrainings = new Set(
                    workoutLogs.map((log: any) => log.training._id)
                );

                // Build training days map
                const days = new Map<string, TrainingDay>();
                trainings.forEach((training: any) => {
                    const date = new Date(training.scheduledDate);
                    const dateString = date.toISOString().split('T')[0];
                    const isCompleted = completedTrainings.has(training._id);

                    days.set(dateString, {
                        isCompleted,
                        title: training.title,
                    });
                });

                setTrainingDays(days);
            } catch (error) {
                console.error('Error fetching training data:', error);
            }
        };

        fetchActivity();
        fetchTrainingData();
    }, [isTrainer]);

    const calculateStreak = (activity: ActivityData) => {
        if (!Array.isArray(activity) || activity.length === 0) {
            setStreak(0);
            return;
        }

        const dates = (activity as Array<{ date: string; workouts?: number }>)
            .map((item) => startOfDay(parseISO(item.date)))
            .sort((a, b) => b.getTime() - a.getTime());

        let streakCount = 0;
        let currentDate = startOfDay(new Date());

        for (const date of dates) {
            const diff = differenceInDays(currentDate, date);
            if (diff === streakCount) {
                streakCount++;
            } else {
                break;
            }
        }

        setStreak(streakCount);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const monthNum = date.getMonth();
        return new Date(year, monthNum + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const hasActivity = (day: number) => {
        const dateStr = format(new Date(month.getFullYear(), month.getMonth(), day), 'yyyy-MM-dd');
        return Array.isArray(data) && data.some((item: any) => item.date === dateStr);
    };

    const getTrainerMemberCount = (day: number) => {
        const dateStr = format(new Date(month.getFullYear(), month.getMonth(), day), 'yyyy-MM-dd');
        const dayData = data.find((item: any) => item.date === dateStr);
        if (!dayData) return 0;

        // Sum all members across all teams for this day
        const count = Object.entries(dayData)
            .filter(([key]) => key !== 'date')
            .reduce((total, [_, value]) => total + (typeof value === 'number' ? value : 0), 0);

        return count;
    };

    const previousMonth = () => {
        setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
    };

    const nextMonth = () => {
        setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        if (isTrainer && hasActivity(day)) {
            const dateStr = format(new Date(month.getFullYear(), month.getMonth(), day), 'yyyy-MM-dd');
            router.push(`/dashboard/activity/${dateStr}`);
        }
    };

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

    // Always show calendar, even if no activity yet
    if (!Array.isArray(data)) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>Unable to load activity data</p>
            </div>
        );
    }

    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, () => null);

    return (
        <div className="space-y-4">
            {/* Streak Counter */}
            {!isTrainer && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🔥</div>
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Streak</p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak} days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Calendar */}
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{format(month, 'MMMM yyyy')}</CardTitle>
                        <div className="flex gap-2">
                            <button
                                onClick={previousMonth}
                                className="px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                ←
                            </button>
                            {month <= new Date() && (
                                <button
                                    onClick={nextMonth}
                                    className="px-3 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    →
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {emptyDays.map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square" />
                            ))}
                            {days.map((day) => {
                                const active = hasActivity(day);
                                const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
                                const isCurrentDay = isToday(currentDate);
                                const dateStr = format(currentDate, 'yyyy-MM-dd');
                                const isHovered = hoveredDate === dateStr;
                                const memberCount = isTrainer ? getTrainerMemberCount(day) : 0;

                                // Check if this day has a scheduled training (for members)
                                const trainingData = !isTrainer ? trainingDays.get(dateStr) : null;
                                const hasScheduledTraining = trainingData !== undefined;
                                const isTrainingCompleted = trainingData?.isCompleted ?? false;

                                // Determine the color:
                                // - Blue for completed trainings (from activity data)
                                // - Pale blue for scheduled but not completed (from training data)
                                // - Gray for no training
                                let bgColor = 'bg-slate-100 dark:bg-slate-800';
                                let textColor = 'text-slate-700 dark:text-slate-300';

                                if (active) {
                                    // Has activity (completed workout)
                                    bgColor = 'bg-blue-600 dark:bg-blue-500';
                                    textColor = 'text-white';
                                } else if (hasScheduledTraining && !isTrainingCompleted) {
                                    // Scheduled but not completed
                                    bgColor = 'bg-blue-100 dark:bg-blue-900';
                                    textColor = 'text-slate-700 dark:text-slate-200';
                                }

                                return (
                                    <div
                                        key={day}
                                        onMouseEnter={() => {
                                            if (isTrainer && active) {
                                                setHoveredDate(dateStr);
                                                setHoveredMemberCount(memberCount);
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        onClick={() => handleDateClick(day)}
                                        title={trainingData ? trainingData.title : ''}
                                        className={`
                                            relative aspect-square rounded-lg flex items-center justify-center font-semibold text-sm
                                            transition-all
                                            ${bgColor}
                                            ${textColor}
                                            ${isCurrentDay ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-900' : ''}
                                            ${isTrainer && active ? 'cursor-pointer hover:shadow-xl' : ''}
                                        `}
                                    >
                                        {active ? <strong>{day}</strong> : day}

                                        {/* Trainer hover tooltip */}
                                        {isHovered && isTrainer && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-50 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-normal shadow-lg z-50">
                                                {memberCount} member{memberCount !== 1 ? 's' : ''} trained
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 text-sm mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded"></div>
                                <span className="text-slate-600 dark:text-slate-400">Trained</span>
                            </div>
                            {!isTrainer && (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded border border-blue-300 dark:border-blue-700"></div>
                                    <span className="text-slate-600 dark:text-slate-400">Scheduled</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <span className="text-slate-600 dark:text-slate-400">No training</span>
                            </div>
                            {isTrainer && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 dark:text-slate-400">Click on a trained day to see details</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
