'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Navbar } from '@/components/Navbar';
import { ChevronLeft, Edit, Trash2, Users, Mail, UserPlus, Eye, Award, User as UserIcon } from 'lucide-react';
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
        role?: 'member' | 'coach' | 'trainer';
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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState<{ isOpen: boolean; memberId: string; memberName: string }>({ isOpen: false, memberId: '', memberName: '' });
    const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

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

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete team');
            router.push('/teams');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete team');
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const handleRemoveMemberClick = (memberId: string, memberName: string) => {
        setShowRemoveMemberDialog({ isOpen: true, memberId, memberName });
    };

    const handleConfirmRemoveMember = async () => {
        const memberId = showRemoveMemberDialog.memberId;
        setRemovingMemberId(memberId);
        try {
            const res = await fetch(`/api/teams/${id}/members/${memberId}`, {
                method: 'DELETE',
                credentials: 'include',
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
            setShowRemoveMemberDialog({ isOpen: false, memberId: '', memberName: '' });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove member');
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleSetRole = async (memberId: string, nextRole: 'member' | 'coach') => {
        setRoleUpdatingId(memberId);
        try {
            const res = await fetch(`/api/teams/${id}/members/${memberId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: nextRole }),
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || 'Failed to update role');
            }
            const data = await res.json();
            setTeam(data.team);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setRoleUpdatingId(null);
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
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
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
                            // Filter out duplicate members by _id
                            Array.from(new Map(team.members.map(m => [m._id, m])).values()).map((member) => (
                                <Card key={member._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                        {member.role === 'coach' ? (
                                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                                        ) : (
                                                            <UserIcon className="w-3.5 h-3.5" />
                                                        )}
                                                        {member.role === 'coach' ? 'Coach' : 'Member'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </p>
                                            </div>
                                            {user?.role === 'trainer' && (
                                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/teams/${id}/members/${member._id}`)}
                                                        className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Logs
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        {member.role === 'coach' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetRole(member._id, 'member')}
                                                                disabled={roleUpdatingId === member._id}
                                                                className="flex-1 sm:flex-none"
                                                            >
                                                                Demote
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetRole(member._id, 'coach')}
                                                                disabled={roleUpdatingId === member._id}
                                                                className="flex-1 sm:flex-none"
                                                            >
                                                                Promote
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleRemoveMemberClick(member._id, member.name)}
                                                            disabled={removingMemberId === member._id}
                                                            className="flex-1 sm:flex-none"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
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

            {/* Delete Team Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "<span className="font-semibold">{team?.name}</span>"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Member Confirmation Dialog */}
            <Dialog open={showRemoveMemberDialog.isOpen} onOpenChange={(open) => {
                if (!open) setShowRemoveMemberDialog({ isOpen: false, memberId: '', memberName: '' });
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "<span className="font-semibold">{showRemoveMemberDialog.memberName}</span>" from the team?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRemoveMemberDialog({ isOpen: false, memberId: '', memberName: '' })}
                            disabled={removingMemberId !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmRemoveMember}
                            disabled={removingMemberId !== null}
                        >
                            {removingMemberId ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
