'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Navbar } from '@/components/Navbar';
import { ChevronLeft, Edit, Trash2, Users, Mail, UserPlus } from 'lucide-react';
import { AddMemberModal } from '@/components/AddMemberModal';
import { useAuth } from '@/contexts/AuthContext';

type Team = {
    _id: string;
    name: string;
    description?: string;
    trainer?: {
        _id: string;
        name: string;
        email: string;
    };
    members?: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
};

export default function TeamDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

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
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load team';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this team?')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete team');
            router.push('/teams');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete team');
            setIsDeleting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        setRemovingMemberId(memberId);
        try {
            const res = await fetch(`/api/teams/${id}/members/${memberId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to remove member');
            }
            // Update team state to remove the member
            setTeam(prev => prev ? {
                ...prev,
                members: prev.members?.filter(m => m._id !== memberId) || []
            } : null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove member');
        } finally {
            setRemovingMemberId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <Navbar currentPage="teams" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link href={user?.role === 'member' ? '/dashboard' : '/teams'} className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2 mb-6">
                        <ChevronLeft className="w-4 h-4" />
                        {user?.role === 'member' ? 'Back to Dashboard' : 'Back to Teams'}
                    </Link>
                    <div className="text-center text-slate-600 dark:text-slate-400">Loading team details...</div>
                </main>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
                <Navbar currentPage="teams" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link href={user?.role === 'member' ? '/dashboard' : '/teams'} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5 mb-6">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        {user?.role === 'member' ? 'Back to Dashboard' : 'Back to Teams'}
                    </Link>
                    <Card className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950">
                        <CardContent className="py-8 text-center text-danger-700 dark:text-danger-200">
                            {error || 'Team not found'}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <Navbar currentPage="teams" />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link href={user?.role === 'member' ? '/dashboard' : '/teams'} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 hover:-translate-x-0.5 mb-6">
                    <ChevronLeft className="w-4 h-4 transition-transform" />
                    {user?.role === 'member' ? 'Back to Dashboard' : 'Back to Teams'}
                </Link>
                {/* Header Card */}
                <Card className="shadow-lg mb-8">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-3xl mb-2">{team.name}</CardTitle>
                                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                                    {team.description || 'No description provided'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Team Info */}
                        {team.trainer && (
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Trainer</p>
                                </div>
                                <div className="ml-8">
                                    <p className="text-slate-900 dark:text-white font-medium">{team.trainer.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {team.trainer.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Only for trainers */}
                        {user?.role === 'trainer' && (
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    className="flex-1 min-w-[120px]"
                                    onClick={() => setShowAddMemberModal(true)}
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Member
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 min-w-[120px]"
                                    onClick={() => router.push(`/teams/${id}/edit`)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Team
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Members Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        Team Members ({team.members?.length || 0})
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {team.members && team.members.length > 0 ? (
                            team.members.map((member) => (
                                <Card key={member._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </p>
                                            </div>
                                            {user?.role === 'trainer' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    disabled={removingMemberId === member._id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-slate-500 dark:text-slate-400">
                                    No members added yet
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {team && (
                <AddMemberModal
                    isOpen={showAddMemberModal}
                    onClose={() => setShowAddMemberModal(false)}
                    teamId={team._id}
                    teamName={team.name}
                />
            )}
        </div>
    );
}
