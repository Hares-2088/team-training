'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { NumberInput } from '@/components/ui/number-input';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, CheckCircle } from 'lucide-react';

type Exercise = {
    name: string;
    sets: number;
    reps: string;
    restTime?: number;
    notes: string;
};

type Training = {
    _id: string;
    title: string;
    description?: string;
    exercises: Exercise[];
    team?: { _id: string; name: string };
    scheduledDate: string;
};

type ExerciseLog = {
    name: string;
    targetSets: number;
    targetReps: string;
    restTime: number;
    logs: Array<{
        set: number;
        weight: number;
        weightUnit: 'lbs' | 'kg' | 'bodyweight';
        reps: number;
        rpe: number;
        notes: string;
    }>;
};

export default function LogWorkoutPage() {
    const params = useParams();
    const router = useRouter();
    const { user, activeTeam } = useAuth();
    const trainingId = params.id as string;

    const [training, setTraining] = useState<Training | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
    const [reorderedExercises, setReorderedExercises] = useState<Exercise[]>([]);
    const [defaultWeightUnit, setDefaultWeightUnit] = useState<'lbs' | 'kg' | 'bodyweight'>('lbs');
    const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
    const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
    const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
    const [workoutEndTime, setWorkoutEndTime] = useState<Date | null>(null);

    // Timer state
    const [restTime, setRestTime] = useState(0);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const fetchTraining = async () => {
            try {
                const res = await fetch(`/api/trainings/${trainingId}`, { credentials: 'include' });
                if (!res.ok) {
                    const payload = await res.json();
                    throw new Error(payload.error || 'Failed to load training');
                }

                const data = await res.json();
                setTraining(data.training);

                // Initialize reordered exercises with original order
                setReorderedExercises([...data.training.exercises]);

                // Initialize exercise logs
                const logs = data.training.exercises.map((ex: Exercise) => ({
                    name: ex.name,
                    targetSets: ex.sets,
                    targetReps: ex.reps,
                    restTime: ex.restTime || 90,
                    logs: Array(ex.sets)
                        .fill(null)
                        .map((_, i) => ({
                            set: i + 1,
                            weight: 0,
                            weightUnit: defaultWeightUnit,
                            reps: 0,
                            rpe: 5,
                            notes: '',
                        })),
                }));
                setExerciseLogs(logs);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load training';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTraining();
    }, [trainingId]);

    // Rest timer effect
    useEffect(() => {
        if (!showRestTimer || restTime === 0) return;

        const interval = setInterval(() => {
            setRestTime((prev) => {
                if (prev <= 1) {
                    setShowRestTimer(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showRestTimer, restTime]);

    // Elapsed time effect
    useEffect(() => {
        if (!isWorkoutStarted || isWorkoutCompleted) return;

        const interval = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isWorkoutStarted, isWorkoutCompleted]);

    const moveExerciseUp = (index: number) => {
        if (index === 0) return;
        const newOrder = [...reorderedExercises];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setReorderedExercises(newOrder);
    };

    const moveExerciseDown = (index: number) => {
        if (index === reorderedExercises.length - 1) return;
        const newOrder = [...reorderedExercises];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setReorderedExercises(newOrder);
    };

    const startWorkout = () => {
        // Initialize exercise logs with reordered exercises
        const logs = reorderedExercises.map((ex: Exercise) => ({
            name: ex.name,
            targetSets: ex.sets,
            targetReps: ex.reps,
            restTime: ex.restTime || 90,
            logs: Array(ex.sets)
                .fill(null)
                .map((_, i) => ({
                    set: i + 1,
                    weight: 0,
                    weightUnit: defaultWeightUnit,
                    reps: 0,
                    rpe: 5,
                    notes: '',
                })),
        }));
        setExerciseLogs(logs);

        setIsWorkoutStarted(true);
        setWorkoutStartTime(new Date());
    };

    const completeWorkout = async () => {
        setWorkoutEndTime(new Date());
        setIsWorkoutCompleted(true);

        // Transform exerciseLogs to flat array format for database
        const flattenedExercises = exerciseLogs.flatMap((exercise) =>
            exercise.logs.map((log) => ({
                exerciseName: exercise.name,
                setNumber: log.set,
                weight: log.weight,
                weightUnit: log.weightUnit,
                reps: log.reps,
                rpe: log.rpe,
                notes: log.notes,
            }))
        );

        // Save workout logs to database
        try {
            const res = await fetch(`/api/trainings/${trainingId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    exercises: flattenedExercises,
                    startTime: workoutStartTime,
                    endTime: new Date(),
                    duration: elapsedTime,
                }),
            });

            if (!res.ok) {
                const payload = await res.json();
                alert(`Failed to save workout: ${payload.error || 'Unknown error'}`);
                throw new Error(payload.error || 'Failed to save workout');
            }
        } catch (err) {
            console.error('Error saving workout:', err);
        }
    };

    const updateExerciseLog = (
        exerciseIndex: number,
        setNumber: number,
        field: 'weight' | 'weightUnit' | 'reps' | 'rpe' | 'notes',
        value: number | string
    ) => {
        const newLogs = [...exerciseLogs];
        (newLogs[exerciseIndex].logs[setNumber - 1] as any)[field] = value;
        setExerciseLogs(newLogs);
    };

    const updateAllWeightUnits = (unit: 'lbs' | 'kg' | 'bodyweight') => {
        setDefaultWeightUnit(unit);
        const newLogs = [...exerciseLogs];
        newLogs.forEach(exercise => {
            exercise.logs.forEach(log => {
                log.weightUnit = unit;
            });
        });
        setExerciseLogs(newLogs);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        return `${minutes}m ${secs}s`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="dashboard" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center text-slate-600 dark:text-slate-400">Loading training...</div>
                </main>
            </div>
        );
    }

    if (error || !training) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="dashboard" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950">
                        <CardContent className="py-8 text-center text-danger-700 dark:text-danger-200">
                            {error || 'Training not found'}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (isWorkoutCompleted) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="dashboard" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="shadow-lg">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="w-16 h-16 text-success-600 dark:text-success-400" />
                            </div>
                            <CardTitle className="text-3xl">Workout Complete!</CardTitle>
                            <CardDescription>Great job finishing your session</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatTime(elapsedTime)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Exercises</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {exerciseLogs.length}
                                    </p>
                                </div>
                            </div>

                            {/* Exercise Summary */}
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Exercise Summary</h3>
                                <div className="space-y-3">
                                    {exerciseLogs.map((ex, idx) => (
                                        <div key={idx} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                            <p className="font-medium text-slate-900 dark:text-white">{ex.name}</p>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                {ex.logs
                                                    .filter((log) => log.weight > 0 || log.reps > 0)
                                                    .map((log, i) => (
                                                        <p key={i}>
                                                            Set {log.set}: {log.weightUnit === 'bodyweight' ? 'Bodyweight' : `${log.weight}${log.weightUnit}`} × {log.reps} reps (RPE {log.rpe}/10)
                                                        </p>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6">
                                <Link href="/dashboard" className="flex-1">
                                    <Button className="w-full">Back to Dashboard</Button>
                                </Link>
                                <Link href="/trainings" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        View All Trainings
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    if (!isWorkoutStarted) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar currentPage="dashboard" />
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all flex items-center gap-2 mb-8 hover:-translate-x-0.5">
                        <ChevronLeft className="w-4 h-4 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <Card className="shadow-lg mb-8">
                        <CardHeader>
                            <CardTitle className="text-3xl">{training.title}</CardTitle>
                            <CardDescription className="text-base">
                                {training.description || 'No description provided'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Training Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Team
                                    </Label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                                        {training.team?.name || 'No team'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Scheduled Date
                                    </Label>
                                    <p className="text-lg font-medium text-slate-900 dark:text-white mt-1">
                                        {new Date(training.scheduledDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Exercises Overview */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <Label className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                        Exercises
                                    </Label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Reorder to fit your preference
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {reorderedExercises.map((ex, idx) => (
                                        <div key={`${ex.name}-${idx}`} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveExerciseUp(idx)}
                                                    disabled={idx === 0}
                                                    className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <ChevronUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveExerciseDown(idx)}
                                                    disabled={idx === reorderedExercises.length - 1}
                                                    className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <ChevronDown className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{ex.name}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {ex.sets} sets × {ex.reps} reps
                                                        </p>
                                                    </div>
                                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <Button onClick={startWorkout} size="lg" className="w-full">
                                Start Workout
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const currentExercise = exerciseLogs[currentExerciseIndex];
    const currentSetLog = currentExercise.logs[currentSet - 1];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Navbar currentPage="dashboard" />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header with Timer */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {training.title}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Exercise {currentExerciseIndex + 1} of {exerciseLogs.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono">{formatTime(elapsedTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Rest Timer */}
                {showRestTimer && (
                    <Card className="mb-6 bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800">
                        <CardContent className="py-6 text-center">
                            <p className="text-sm text-warning-700 dark:text-warning-300 mb-2">Rest Time</p>
                            <p className="text-4xl font-bold text-warning-600 dark:text-warning-400 font-mono">
                                {restTime}s
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setShowRestTimer(false)}
                            >
                                Skip Rest
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Exercise Card */}
                <Card className="shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
                        <CardDescription>
                            Set {currentSet} of {currentExercise.targetSets} • {currentExercise.targetReps} reps target
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Logging Form */}
                        <div className="space-y-4">
                            {/* Weight Unit Global Setting */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <Label className="text-sm font-medium">
                                    Weight Unit (applied to all sets)
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="weight" className="text-xs">
                                        {currentSetLog.weightUnit === 'bodyweight' ? 'Bodyweight' : `Weight (${currentSetLog.weightUnit})`}
                                    </Label>
                                    {currentSetLog.weightUnit === 'bodyweight' ? (
                                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Bodyweight Exercise
                                        </div>
                                    ) : (
                                        <NumberInput
                                            id="weight"
                                            value={currentSetLog.weight}
                                            onChange={(value) =>
                                                updateExerciseLog(currentExerciseIndex, currentSet, 'weight', value)
                                            }
                                            min={0}
                                            step={currentSetLog.weightUnit === 'kg' ? 2.5 : 5}
                                            className="mt-2"
                                        />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="reps" className="text-xs">
                                        Reps
                                    </Label>
                                    <NumberInput
                                        id="reps"
                                        value={currentSetLog.reps}
                                        onChange={(value) =>
                                            updateExerciseLog(currentExerciseIndex, currentSet, 'reps', value)
                                        }
                                        min={0}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RPE Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <Label htmlFor="rpe" className="text-xs">
                                    RPE (Rate of Perceived Exertion)
                                </Label>
                                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                    {currentSetLog.rpe}/10
                                </span>
                            </div>
                            <input
                                id="rpe"
                                type="range"
                                min="1"
                                max="10"
                                value={currentSetLog.rpe}
                                onChange={(e) =>
                                    updateExerciseLog(currentExerciseIndex, currentSet, 'rpe', parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>Easy</span>
                                <span>Hard</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes" className="text-xs">
                                Notes (optional)
                            </Label>
                            <Input
                                id="notes"
                                placeholder="How did you feel? Any form issues?"
                                value={currentSetLog.notes}
                                onChange={(e) =>
                                    updateExerciseLog(currentExerciseIndex, currentSet, 'notes', e.target.value)
                                }
                                className="mt-2"
                            />
                        </div>

                        {/* Set Progress */}
                        {currentSet < currentExercise.targetSets && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Ready for next set?</p>
                                <Button
                                    onClick={() => {
                                        setRestTime(currentExercise.restTime);
                                        setShowRestTimer(true);
                                        setCurrentSet(currentSet + 1);
                                    }}
                                    className="w-full"
                                >
                                    Next Set ({currentExercise.restTime}s Rest)
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation and Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1));
                            setCurrentSet(1);
                        }}
                        disabled={currentExerciseIndex === 0}
                        className="flex-1"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous Exercise
                    </Button>

                    {currentExerciseIndex === exerciseLogs.length - 1 && currentSet === currentExercise.targetSets ? (
                        <Button onClick={completeWorkout} className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Workout
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                if (currentSet === currentExercise.targetSets) {
                                    setCurrentSet(1);
                                    setCurrentExerciseIndex(Math.min(exerciseLogs.length - 1, currentExerciseIndex + 1));
                                }
                            }}
                            disabled={currentExerciseIndex === exerciseLogs.length - 1 && currentSet < currentExercise.targetSets}
                            className="flex-1"
                        >
                            Next Exercise
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}
