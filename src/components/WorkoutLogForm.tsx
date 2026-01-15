'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface WorkoutExercise {
    exerciseName: string;
    setNumber: number;
    weight: number;
    reps: number;
    notes: string;
}

interface WorkoutLogFormProps {
    trainingId: string;
    exercises: Array<{ name: string; sets: number; reps: string }>;
    onSubmit: (data: { exercises: WorkoutExercise[]; notes: string }) => void;
    isLoading?: boolean;
}

export function WorkoutLogForm({
    trainingId,
    exercises,
    onSubmit,
    isLoading = false,
}: WorkoutLogFormProps) {
    const [workoutData, setWorkoutData] = useState<WorkoutExercise[]>([]);
    const [notes, setNotes] = useState('');

    const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: any) => {
        const newData = [...workoutData];
        newData[index] = { ...newData[index], [field]: value };
        setWorkoutData(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ exercises: workoutData, notes });
    };

    // Initialize workout data structure
    if (workoutData.length === 0 && exercises.length > 0) {
        const initialized = exercises.flatMap((ex) =>
            Array(ex.sets)
                .fill(null)
                .map((_, setIdx) => ({
                    exerciseName: ex.name,
                    setNumber: setIdx + 1,
                    weight: 0,
                    reps: 0,
                    notes: '',
                }))
        );
        setWorkoutData(initialized);
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Log Your Workout</CardTitle>
                <CardDescription>Enter your weight and reps for each exercise</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {workoutData.map((item, index) => (
                            <div
                                key={`${item.exerciseName}-${item.setNumber}`}
                                className="p-4 border rounded-lg space-y-3"
                            >
                                <h4 className="font-semibold text-sm">
                                    {item.exerciseName} - Set {item.setNumber}
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <Label htmlFor={`weight-${index}`} className="text-xs">
                                            Weight (lbs)
                                        </Label>
                                        <Input
                                            id={`weight-${index}`}
                                            type="number"
                                            placeholder="0"
                                            value={item.weight || ''}
                                            onChange={(e) =>
                                                handleExerciseChange(index, 'weight', parseFloat(e.target.value) || 0)
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`reps-${index}`} className="text-xs">
                                            Reps
                                        </Label>
                                        <Input
                                            id={`reps-${index}`}
                                            type="number"
                                            placeholder="0"
                                            value={item.reps || ''}
                                            onChange={(e) =>
                                                handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`notes-${index}`} className="text-xs">
                                            Notes
                                        </Label>
                                        <Input
                                            id={`notes-${index}`}
                                            placeholder="Optional"
                                            value={item.notes}
                                            onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label htmlFor="notes" className="text-sm">
                            Overall Notes
                        </Label>
                        <Input
                            id="notes"
                            placeholder="How did you feel? Any modifications?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Saving...' : 'Save Workout'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
