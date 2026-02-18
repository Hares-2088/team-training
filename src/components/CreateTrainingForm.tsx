'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Parse date string (YYYY-MM-DD) as local date, not UTC
const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    notes: string;
}

interface CreateTrainingFormProps {
    defaultTeamId?: string;
    initialTitle?: string;
    initialDescription?: string;
    initialExercises?: Exercise[];
    onSubmit: (data: {
        title: string;
        description: string;
        scheduledDates: string[];
        exercises: Exercise[];
        teamId: string;
    }) => void;
    isLoading?: boolean;
}

export function CreateTrainingForm({
    defaultTeamId = '',
    initialTitle = '',
    initialDescription = '',
    initialExercises,
    onSubmit,
    isLoading = false,
}: Readonly<CreateTrainingFormProps>) {
    const { user, activeTeam } = useAuth();
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [scheduledDates, setScheduledDates] = useState<string[]>([]);
    const [teamId, setTeamId] = useState(defaultTeamId);
    const [exercises, setExercises] = useState<Exercise[]>(
        initialExercises && initialExercises.length > 0
            ? initialExercises
            : [{ name: '', sets: 3, reps: '10', restTime: 90, notes: '' }]
    );
    const [teams, setTeams] = useState<Array<{ _id: string; name: string; trainer?: { _id: string }; members?: Array<{ _id: string }> }>>([]);
    const [exerciseOptions, setExerciseOptions] = useState<ComboboxOption[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teamsRes = await fetch('/api/teams');
                const teamsData = await teamsRes.json();

                // Filter to teams user can create trainings for:
                // Trainers: their owned teams; Coaches/Members: teams where they are a member.
                const filtered = Array.isArray(teamsData)
                    ? teamsData.filter((t: any) => {
                        if (!user) return false;
                        // Show all teams where user is trainer or member
                        const isTrainer = (t.trainer?._id || String(t.trainer)) === user._id;
                        const isMember = Array.isArray(t.members) && t.members.some((m: any) => (m?._id || String(m)) === user._id);
                        return isTrainer || isMember;
                    })
                    : [];
                setTeams(filtered);

                // Prefer active team, else defaultTeamId, else first allowed team
                if (activeTeam.teamId && filtered.some((t) => t._id === activeTeam.teamId)) {
                    setTeamId(activeTeam.teamId);
                } else if (defaultTeamId) {
                    setTeamId(defaultTeamId);
                } else if (filtered.length > 0) {
                    setTeamId(filtered[0]._id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [activeTeam.teamId, activeTeam.role, defaultTeamId, user]);

    // Fetch exercises when teamId changes
    useEffect(() => {
        const fetchExercises = async () => {
            if (!teamId) return;

            try {
                const exercisesRes = await fetch(`/api/exercises?teamId=${teamId}`);
                const exercisesData = await exercisesRes.json();

                // Set exercise options
                if (Array.isArray(exercisesData)) {
                    setExerciseOptions(exercisesData.map((ex: any) => ({
                        value: ex.name,
                        label: ex.name
                    })));
                }
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };
        fetchExercises();
    }, [teamId]);

    const handleDateChange = (date: string) => {
        setScheduledDates((prev) => {
            if (prev.includes(date)) {
                return prev.filter((d) => d !== date);
            } else {
                return [...prev, date].sort();
            }
        });
    };

    const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const handleCreateNewExercise = async (exerciseName: string, index: number) => {
        try {
            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: exerciseName, teamId }),
            });

            if (res.ok) {
                const newExercise = await res.json();
                // Add to options
                setExerciseOptions(prev => [...prev, { value: newExercise.name, label: newExercise.name }]);
                // Update exercise name
                handleExerciseChange(index, 'name', newExercise.name);
            }
        } catch (error) {
            console.error('Error creating exercise:', error);
        }
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: '10', restTime: 90, notes: '' }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (scheduledDates.length === 0) {
            alert('Please select at least one date');
            return;
        }
        onSubmit({ title, description, scheduledDates, exercises, teamId });
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
                        <Label htmlFor="teamId">Team</Label>
                        <Select value={teamId} onValueChange={setTeamId} required>
                            <SelectTrigger className="mt-2 w-full">
                                <SelectValue placeholder="Select a team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team._id} value={team._id}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the training"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2"
                            rows={6}
                        />
                    </div>

                    <div>
                        <Label>Scheduled Dates (select multiple)</Label>
                        <div className="mt-2">
                            <DatePicker
                                id="date"
                                value={scheduledDates[0] || ''}
                                onChange={handleDateChange}
                            />
                        </div>
                        {scheduledDates.length > 0 && (
                            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                <p className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    Selected Dates ({scheduledDates.length}):
                                </p>
                                <div className="space-y-1">
                                    {scheduledDates.map((date) => (
                                        <div key={date} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {parseLocalDate(date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDateChange(date)}
                                                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">Exercises</h3>

                        <div className="space-y-4">
                            {exercises.map((ex, index) => (
                                <div key={`exercise-${index}`} className="p-4 border rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`ex-name-${index}`} className="text-xs">
                                                Exercise Name
                                            </Label>
                                            <Combobox
                                                options={exerciseOptions}
                                                value={ex.name}
                                                onChange={(value) => handleExerciseChange(index, 'name', value)}
                                                onCreateNew={(newName) => handleCreateNewExercise(newName, index)}
                                                placeholder="Select or create exercise..."
                                                emptyText="No exercises found."
                                                searchPlaceholder="Search exercises..."
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`ex-sets-${index}`} className="text-xs">
                                                Sets
                                            </Label>
                                            <NumberInput
                                                id={`ex-sets-${index}`}
                                                value={ex.sets}
                                                onChange={(value) => handleExerciseChange(index, 'sets', value)}
                                                min={1}
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
                                            <Label htmlFor={`ex-rest-${index}`} className="text-xs">
                                                Rest Time (seconds)
                                            </Label>
                                            <NumberInput
                                                id={`ex-rest-${index}`}
                                                value={ex.restTime}
                                                onChange={(value) => handleExerciseChange(index, 'restTime', value)}
                                                min={0}
                                                step={5}
                                                className="mt-1"
                                            />
                                        </div>
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

                        <Button type="button" variant="outline" onClick={addExercise} className="w-full mt-4">
                            + Add Exercise
                        </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Creating...' : 'Create Training'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
