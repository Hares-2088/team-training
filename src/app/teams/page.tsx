'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTeamForm } from '@/components/CreateTeamForm';
import { useState } from 'react';

export default function TeamsPage() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const userId = '1'; // Replace with actual user ID from auth

    const teams = [
        {
            id: '1',
            name: 'CrossFit Squad',
            description: 'High-intensity functional training',
            memberCount: 8,
            trainerName: 'You',
        },
    ];

    const handleCreateTeam = async (data: { name: string; description: string }) => {
        console.log('Creating team:', data);
        // Replace with actual API call
        setShowCreateForm(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <nav className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-indigo-600">💪 TeamTrainer</h1>
                        <div className="flex gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
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
                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
                        <p className="text-gray-600 mt-1">Manage your teams and members</p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? 'Cancel' : 'Create Team'}
                    </Button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="mb-12 max-w-md">
                        <CreateTeamForm
                            userId={userId}
                            onSubmit={handleCreateTeam}
                        />
                    </div>
                )}

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <Card
                                key={team.id}
                                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                <CardHeader>
                                    <CardTitle>{team.name}</CardTitle>
                                    <CardDescription>{team.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>👥 {team.memberCount} members</span>
                                            <span>👨‍🏫 {team.trainerName}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/teams/${team.id}`} className="flex-1">
                                                <Button className="w-full" variant="default">
                                                    View Team
                                                </Button>
                                            </Link>
                                            <Button variant="outline">Edit</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-0 shadow-lg col-span-full">
                            <CardContent className="py-12 text-center">
                                <p className="text-gray-500 text-lg">No teams yet</p>
                                <p className="text-gray-400 mt-2">Create your first team to get started</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
