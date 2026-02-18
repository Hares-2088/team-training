'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface WorkoutExercise {
    exerciseName: string;
    setNumber: number;
    weight: number;
    weightUnit: 'lbs' | 'kg' | 'bodyweight';
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
}: Readonly<WorkoutLogFormProps>) {
    const [workoutData, setWorkoutData] = useState<WorkoutExercise[]>([]);
    const [notes, setNotes] = useState('');

    const handleExerciseChange = (index: number, field: keyof WorkoutExercise, value: any) => {
        const newData = [...workoutData];
        newData[index] = { ...newData[index], [field]: value };
        setWorkoutData(newData);
    };

    const updateAllWeightUnits = (unit: 'lbs' | 'kg' | 'bodyweight') => {
        setDefaultWeightUnit(unit);
        const newData = [...workoutData];
        newData.forEach(item => {
            item.weightUnit = unit;
        });
        setWorkoutData(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ exercises: workoutData, notes });
    };

    // Initialize workout data structure
    if (workoutData.length === 0 && exercises.length > 0) {
        const initialized = exercises.flatMap((ex) =>
            new Array(ex.sets)
                .fill(null)
                .map((_, setIdx) => ({
                    exerciseName: ex.name,
                    setNumber: setIdx + 1,
                    weight: 0,
                    weightUnit: defaultWeightUnit,
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
                    {/* Global Weight Unit Setting */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <Label className="text-sm font-medium">
                            Weight Unit (applied to all exercises)
                        </Label>
                        <Select value={defaultWeightUnit} onValueChange={updateAllWeightUnits}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                <SelectItem value="bodyweight">Bodyweight</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                                            {item.weightUnit === 'bodyweight' ? 'Bodyweight' : `Weight (${item.weightUnit})`}
                                        </Label>
                                        {item.weightUnit === 'bodyweight' ? (
                                            <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                                Bodyweight Exercise
                                            </div>
                                        ) : (
                                            <NumberInput
                                                id={`weight-${index}`}
                                                value={item.weight || 0}
                                                onChange={(value) => handleExerciseChange(index, 'weight', value)}
                                                min={0}
                                                step={item.weightUnit === 'kg' ? 2.5 : 5}
                                                placeholder="0"
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor={`reps-${index}`} className="text-xs">
                                            Reps
                                        </Label>
                                        <NumberInput
                                            id={`reps-${index}`}
                                            value={item.reps || 0}
                                            onChange={(value) => handleExerciseChange(index, 'reps', value)}
                                            min={0}
                                            placeholder="0"
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
