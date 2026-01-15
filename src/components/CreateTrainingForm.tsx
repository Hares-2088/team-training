'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    notes: string;
}

interface CreateTrainingFormProps {
    teamId: string;
    onSubmit: (data: {
        title: string;
        description: string;
        scheduledDate: string;
        exercises: Exercise[];
    }) => void;
    isLoading?: boolean;
}

export function CreateTrainingForm({
    teamId,
    onSubmit,
    isLoading = false,
}: CreateTrainingFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([
        { name: '', sets: 3, reps: '10', notes: '' },
    ]);

    const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: '10', notes: '' }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, description, scheduledDate, exercises });
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Create New Training</CardTitle>
                <CardDescription>Plan your team's next workout session</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title">Training Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Upper Body Strength"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Brief description of the training"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="date">Scheduled Date & Time</Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                            className="mt-2"
                        />
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Exercises</h3>
                            <Button type="button" variant="outline" onClick={addExercise} size="sm">
                                + Add Exercise
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {exercises.map((ex, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`ex-name-${index}`} className="text-xs">
                                                Exercise Name
                                            </Label>
                                            <Input
                                                id={`ex-name-${index}`}
                                                placeholder="e.g., Bench Press"
                                                value={ex.name}
                                                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`ex-sets-${index}`} className="text-xs">
                                                Sets
                                            </Label>
                                            <Input
                                                id={`ex-sets-${index}`}
                                                type="number"
                                                value={ex.sets}
                                                onChange={(e) =>
                                                    handleExerciseChange(index, 'sets', parseInt(e.target.value) || 1)
                                                }
                                                min="1"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`ex-reps-${index}`} className="text-xs">
                                                Reps
                                            </Label>
                                            <Input
                                                id={`ex-reps-${index}`}
                                                placeholder="e.g., 8-12"
                                                value={ex.reps}
                                                onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`ex-notes-${index}`} className="text-xs">
                                                Notes
                                            </Label>
                                            <Input
                                                id={`ex-notes-${index}`}
                                                placeholder="Optional notes"
                                                value={ex.notes}
                                                onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {exercises.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeExercise(index)}
                                            className="w-full"
                                        >
                                            Remove Exercise
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Creating...' : 'Create Training'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
