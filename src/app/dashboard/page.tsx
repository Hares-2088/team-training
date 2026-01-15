'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function Dashboard() {
    const [userRole] = useState<'trainer' | 'member'>('member');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <nav className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-indigo-600">💪 TeamTrainer</h1>
                        <div className="flex gap-4">
                            <Link href="/teams">
                                <Button variant="ghost">Teams</Button>
                            </Link>
                            <Link href="/trainings">
                                <Button variant="ghost">Trainings</Button>
                            </Link>
                            <Button variant="outline">Logout</Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TeamTrainer</h2>
                    <p className="text-lg text-gray-600">
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
                                        Create New Training
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
                                        <span className="text-2xl">👥</span>
                                        Manage Teams
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
                                        <span className="text-2xl">📋</span>
                                        Upcoming Workouts
                                    </CardTitle>
                                    <CardDescription>View your team's scheduled trainings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/trainings">
                                        <Button className="w-full">View Trainings</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="text-2xl">📊</span>
                                        Log Workout
                                    </CardTitle>
                                    <CardDescription>Record your sets, reps, and progress</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" disabled>
                                        Start Logging
                                    </Button>
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
                                {userRole === 'trainer' ? "Your team's latest logs" : 'Your recent workouts'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500 py-12">
                                <p>No activity yet</p>
                                <p className="text-sm mt-2">
                                    {userRole === 'trainer'
                                        ? 'Create a training to get started'
                                        : 'Log your first workout'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Getting Started Guide */}
                <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Getting Started Guide</h3>
                    <div className="space-y-2 text-blue-800 text-sm">
                        {userRole === 'trainer' ? (
                            <>
                                <p>✅ 1. Create your first training session</p>
                                <p>✅ 2. Add exercises with sets and reps</p>
                                <p>✅ 3. Invite team members</p>
                                <p>✅ 4. Monitor member progress</p>
                            </>
                        ) : (
                            <>
                                <p>✅ 1. View upcoming trainings from your trainer</p>
                                <p>✅ 2. Log your weight and reps for each exercise</p>
                                <p>✅ 3. Add notes about how you felt</p>
                                <p>✅ 4. Track your progress over time</p>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
