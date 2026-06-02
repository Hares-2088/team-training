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

interface Exercise {
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    notes: string;
}

interface PlanWorkout {
    title: string;
    scheduledDate: string;
    exercises: Exercise[];
}

const defaultExercise = (): Exercise => ({ name: '', sets: 3, reps: '10', restTime: 90, notes: '' });
const defaultWorkout = (): PlanWorkout => ({
    title: '',
    scheduledDate: '',
    exercises: [defaultExercise()],
});

interface TeamOption {
    _id: string;
    name: string;
    trainer?: { _id: string };
    members?: Array<{ _id: string }>;
}

interface CreatePlanFormProps {
    defaultTeamId?: string;
    onSubmit: (data: {
        title: string;
        description: string;
        teamId: string;
        isPersonal: boolean;
        workouts: PlanWorkout[];
    }) => void;
    isLoading?: boolean;
    isPersonal?: boolean;
}

export function CreatePlanForm({
    defaultTeamId = '',
    onSubmit,
    isLoading = false,
    isPersonal = false,
}: Readonly<CreatePlanFormProps>) {
    const { user, activeTeam } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [teamId, setTeamId] = useState(defaultTeamId);
    const [workouts, setWorkouts] = useState<PlanWorkout[]>([]);
    const [teams, setTeams] = useState<TeamOption[]>([]);
    const [exerciseOptions, setExerciseOptions] = useState<ComboboxOption[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch('/api/teams');
                const data = await res.json();
                const allTeams: TeamOption[] = Array.isArray(data) ? data : data.teams || [];
                const filtered = allTeams.filter((t) => {
                    if (!user) return false;
                    const isTrainerOfTeam = (t.trainer?._id || String(t.trainer)) === user._id;
                    const isMemberOfTeam =
                        Array.isArray(t.members) &&
                        t.members.some((m: any) => (m?._id || String(m)) === user._id);
                    return isTrainerOfTeam || isMemberOfTeam;
                });
                setTeams(filtered);
                if (activeTeam.teamId && filtered.some((t) => t._id === activeTeam.teamId)) {
                    setTeamId(activeTeam.teamId);
                } else if (defaultTeamId) {
                    setTeamId(defaultTeamId);
                } else if (filtered.length > 0) {
                    setTeamId(filtered[0]._id);
                }
            } catch {
                // ignore
            }
        };
        fetchTeams();
    }, [activeTeam.teamId, defaultTeamId, user]);

    useEffect(() => {
        const fetchExercises = async () => {
            if (!teamId) return;
            try {
                const res = await fetch(`/api/exercises?teamId=${teamId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setExerciseOptions(data.map((ex: any) => ({ value: ex.name, label: ex.name })));
                }
            } catch {
                // ignore
            }
        };
        fetchExercises();
    }, [teamId]);

    // --- Workout helpers ---
    const addWorkout = () => setWorkouts((prev) => [...prev, defaultWorkout()]);

    const removeWorkout = (si: number) => setWorkouts((prev) => prev.filter((_, i) => i !== si));

    const updateWorkoutField = (si: number, field: keyof PlanWorkout, value: any) => {
        setWorkouts((prev) => {
            const next = [...prev];
            next[si] = { ...next[si], [field]: value };
            return next;
        });
    };

    // --- Exercise helpers ---
    const addExercise = (si: number) => {
        setWorkouts((prev) => {
            const next = [...prev];
            next[si] = { ...next[si], exercises: [...next[si].exercises, defaultExercise()] };
            return next;
        });
    };

    const removeExercise = (si: number, ei: number) => {
        setWorkouts((prev) => {
            const next = [...prev];
            next[si] = {
                ...next[si],
                exercises: next[si].exercises.filter((_, i) => i !== ei),
            };
            return next;
        });
    };

    const updateExercise = (si: number, ei: number, field: keyof Exercise, value: any) => {
        setWorkouts((prev) => {
            const next = [...prev];
            const exs = [...next[si].exercises];
            exs[ei] = { ...exs[ei], [field]: value };
            next[si] = { ...next[si], exercises: exs };
            return next;
        });
    };

    const handleCreateNewExercise = async (exerciseName: string, si: number, ei: number) => {
        try {
            const res = await fetch('/api/exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: exerciseName, teamId }),
            });
            if (res.ok) {
                const newExercise = await res.json();
                setExerciseOptions((prev) => [...prev, { value: newExercise.name, label: newExercise.name }]);
                updateExercise(si, ei, 'name', newExercise.name);
            }
        } catch {
            // ignore
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (workouts.length > 0) {
            for (const workout of workouts) {
                if (!workout.title) {
                    setValidationError('Each workout must have a title');
                    return;
                }
                if (!workout.scheduledDate) {
                    setValidationError('Each workout must have a scheduled date');
                    return;
                }
            }
        }
        onSubmit({ title, description, teamId, isPersonal, workouts });
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Create Workout Plan</CardTitle>
                <CardDescription>Build a plan composed of multiple workouts</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Plan name */}
                    <div>
                        <Label htmlFor="plan-title">Plan Name</Label>
                        <Input
                            id="plan-title"
                            placeholder="e.g., Fat Loss Program"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-2"
                        />
                    </div>

                    {/* Team */}
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

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief description of the plan"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2"
                            rows={3}
                        />
                    </div>

                    {/* Workouts */}
                    <div className="border-t pt-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Workouts</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addWorkout}>
                                + Add Workout
                            </Button>
                        </div>

                        {workouts.length === 0 && (
                            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                                No workouts added yet. You can create this plan now and add workouts later from the library.
                            </div>
                        )}

                        {workouts.map((workout, si) => (
                            <div key={`session-${si}`} className="border rounded-lg p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                        Workout {si + 1}
                                    </h4>
                                    {workouts.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeWorkout(si)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Workout Title</Label>
                                        <Input
                                            placeholder="e.g., Run + Core"
                                            value={workout.title}
                                            onChange={(e) => updateWorkoutField(si, 'title', e.target.value)}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Scheduled Date</Label>
                                        <div className="mt-1">
                                            <DatePicker
                                                id={`date-${si}`}
                                                value={workout.scheduledDate}
                                                onChange={(date) => updateWorkoutField(si, 'scheduledDate', date)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Exercises for this workout */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Exercises
                                    </Label>
                                    {workout.exercises.map((ex, ei) => (
                                        <div key={`ex-${si}-${ei}`} className="p-3 bg-white dark:bg-slate-800 border rounded-lg space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs">Exercise Name</Label>
                                                    <Combobox
                                                        options={exerciseOptions}
                                                        value={ex.name}
                                                        onChange={(value) => updateExercise(si, ei, 'name', value)}
                                                        onCreateNew={(name) => handleCreateNewExercise(name, si, ei)}
                                                        placeholder="Select or create..."
                                                        emptyText="No exercises found."
                                                        searchPlaceholder="Search exercises..."
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Sets</Label>
                                                    <NumberInput
                                                        value={ex.sets}
                                                        onChange={(v) => updateExercise(si, ei, 'sets', v)}
                                                        min={1}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-xs">Reps</Label>
                                                    <Input
                                                        placeholder="e.g., 10 or 8-12"
                                                        value={ex.reps}
                                                        onChange={(e) => updateExercise(si, ei, 'reps', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Rest (seconds)</Label>
                                                    <NumberInput
                                                        value={ex.restTime}
                                                        onChange={(v) => updateExercise(si, ei, 'restTime', v)}
                                                        min={0}
                                                        step={5}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Notes</Label>
                                                <Input
                                                    placeholder="Optional notes"
                                                    value={ex.notes}
                                                    onChange={(e) => updateExercise(si, ei, 'notes', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            {workout.exercises.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeExercise(si, ei)}
                                                    className="w-full"
                                                >
                                                    Remove Exercise
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addExercise(si)}
                                        className="w-full"
                                    >
                                        + Add Exercise
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {validationError && (
                        <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                            {validationError}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                        {isLoading ? 'Creating...' : 'Create Plan'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
