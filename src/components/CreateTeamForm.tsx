'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateTeamFormProps {
    userId: string;
    onSubmit: (data: { name: string; description: string }) => void;
    isLoading?: boolean;
}

export function CreateTeamForm({ userId, onSubmit, isLoading = false }: CreateTeamFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description });
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create a New Team</CardTitle>
                <CardDescription>Start training with your members</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., CrossFit Squad"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="What's your team about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Creating...' : 'Create Team'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
