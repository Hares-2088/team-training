'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ActivityChart } from '@/components/ActivityChart';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <Navbar currentPage="dashboard" />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">Loading...</div>
                </main>
            </div>
        );
    }

    const userRole = user?.role || 'member';

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <Navbar currentPage="dashboard" />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome back, {user?.name || 'User'}!
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {userRole === 'trainer'
                            ? 'Create workouts and manage your team'
                            : 'Track your workouts and progress'}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {userRole === 'trainer' ? (
                        <>
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">➕</span>
                                        <span className="inline-block">Create New Training</span>
                                    </CardTitle>
                                    <CardDescription>Design a workout for your team</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/trainings/create">
                                        <Button className="w-full">Create Training</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">🏋️</span>
                                        <span className="inline-block">View Workout Plans</span>
                                    </CardTitle>
                                    <CardDescription>See all workout plans for your teams</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/trainings">
                                        <Button className="w-full">Browse Plans</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">👥</span>
                                        <span className="inline-block">Manage Teams</span>
                                    </CardTitle>
                                    <CardDescription>Create teams and invite members</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/teams">
                                        <Button className="w-full">Go to Teams</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">🏋️</span>
                                        <span className="inline-block">View Workout Plans</span>
                                    </CardTitle>
                                    <CardDescription>Browse and log your workouts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/trainings">
                                        <Button className="w-full">Browse Plans</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">📊</span>
                                        <span className="inline-block">My Workout Stats</span>
                                    </CardTitle>
                                    <CardDescription>View your workout history and progress</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/dashboard/my-trainings" className="block">
                                        <Button className="w-full">View My Workout Stats</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                {userRole === 'trainer'
                                    ? "Your team's training activity by day"
                                    : 'Your workout logging activity by day'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivityChart isTrainer={userRole === 'trainer'} />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
