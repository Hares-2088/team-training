'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Link as LinkIcon, Loader } from 'lucide-react';

type AddMemberModalProps = {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    teamName: string;
};

export function AddMemberModal({ isOpen, onClose, teamId, teamName }: AddMemberModalProps) {
    const [activeTab, setActiveTab] = useState<'code' | 'link'>('code');
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateInviteCode = async () => {
        setIsGenerating(true);
        setError(null);
        setCopied(false);

        try {
            const response = await fetch(`/api/teams/${teamId}/invite-code`, {
                method: 'POST',
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error || 'Failed to generate invite code');
            }

            const data = await response.json();
            setInviteCode(data.inviteCode);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate invite code';
            setError(message);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const inviteLinkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/teams/invite/${teamId}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Invite members to join "{teamName}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950 px-3 py-2 text-sm text-danger-700 dark:text-danger-200">
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'code'
                                    ? 'border-b-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                                }`}
                        >
                            Invite Code
                        </button>
                        <button
                            onClick={() => setActiveTab('link')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'link'
                                    ? 'border-b-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                                }`}
                        >
                            Shareable Link
                        </button>
                    </div>

                    {/* Invite Code Tab */}
                    {activeTab === 'code' && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Generate a code to share with members. They can enter this code to join the team.
                            </p>
                            {!inviteCode ? (
                                <Button
                                    onClick={generateInviteCode}
                                    disabled={isGenerating}
                                    className="w-full"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate Invite Code'
                                    )}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-center text-lg font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                                            {inviteCode}
                                        </div>
                                        <Button
                                            onClick={() => copyToClipboard(inviteCode)}
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {copied && (
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            ✓ Copied to clipboard
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Share this code with members. It will never expire.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shareable Link Tab */}
                    {activeTab === 'link' && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Share this link with members. They can click it to automatically join the team.
                            </p>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white break-all">
                                        {inviteLinkUrl}
                                    </div>
                                    <Button
                                        onClick={() => copyToClipboard(inviteLinkUrl)}
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        ✓ Copied to clipboard
                                    </p>
                                )}
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Members can click this link to join directly. New users will be asked to create an account first.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
