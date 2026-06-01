'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Exercise = {
  name: string;
  sets: number;
  reps: string;
};

type Training = {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  exercises: Exercise[];
};

export default function LogWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionRating, setSessionRating] = useState('5');
  const [notes, setNotes] = useState('');
  const [completionStatus, setCompletionStatus] = useState<'completed' | 'partial' | 'skipped'>('completed');
  const [sessionFeeling, setSessionFeeling] = useState<'great' | 'good' | 'okay' | 'low' | 'bad'>('good');
  const [overallFeedback, setOverallFeedback] = useState('');
  const [skippedExercises, setSkippedExercises] = useState<string[]>([]);

  useEffect(() => {
    const fetchTraining = async () => {
      try {
        const res = await fetch(`/api/trainings/${trainingId}`, { credentials: 'include' });
        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error || 'Failed to load workout');
        }
        const data = (await res.json()) as Training;
        setTraining(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load workout');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTraining();
  }, [trainingId]);

  const toggleSkippedExercise = (exerciseName: string, checked: boolean) => {
    setSkippedExercises((current) => {
      if (checked) {
        return current.includes(exerciseName) ? current : [...current, exerciseName];
      }
      return current.filter((item) => item !== exerciseName);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workouts/${trainingId}/logs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionRating: Number(sessionRating),
          notes,
          completionStatus,
          sessionFeeling,
          overallFeedback,
          skippedExercises,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to save workout log');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save workout log');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar currentPage="dashboard" />
        <main className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-600 dark:text-slate-400 sm:px-6 lg:px-8">
          Loading workout...
        </main>
      </div>
    );
  }

  if (error && !training) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar currentPage="dashboard" />
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8 text-center text-red-600">{error}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar currentPage="dashboard" />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href={`/trainings/${trainingId}`}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workout
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Log Workout</CardTitle>
            <CardDescription>
              {training?.title}
              {training?.description ? ` — ${training.description}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionRating">Session Rating (1-10)</Label>
                  <Input
                    id="sessionRating"
                    type="number"
                    min={1}
                    max={10}
                    value={sessionRating}
                    onChange={(event) => setSessionRating(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Completion Status</Label>
                  <Select value={completionStatus} onValueChange={(value) => setCompletionStatus(value as typeof completionStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select completion status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="partial">Partially completed</SelectItem>
                      <SelectItem value="skipped">Skipped workout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>How did the session feel?</Label>
                <Select value={sessionFeeling} onValueChange={(value) => setSessionFeeling(value as typeof sessionFeeling)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select how the workout felt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">Great</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="okay">Okay</SelectItem>
                    <SelectItem value="low">Low energy</SelectItem>
                    <SelectItem value="bad">Pain or discomfort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {training?.exercises.length ? (
                <div className="space-y-3">
                  <Label>Skipped exercises</Label>
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                    <div className="space-y-3">
                      {training.exercises.map((exercise) => {
                        const checked = skippedExercises.includes(exercise.name);
                        return (
                          <label key={exercise.name} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => toggleSkippedExercise(exercise.name, event.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>
                              <span className="font-medium">{exercise.name}</span>
                              <span className="block text-xs text-slate-500 dark:text-slate-400">
                                {exercise.sets} sets × {exercise.reps}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="overallFeedback">Overall Feedback</Label>
                <Textarea
                  id="overallFeedback"
                  value={overallFeedback}
                  onChange={(event) => setOverallFeedback(event.target.value)}
                  placeholder="How did the session go overall? Any limitations, wins, or adjustments needed?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes about performance, weights, or observations"
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save workout log'
                  )}
                </Button>
                <Link href={`/trainings/${trainingId}`}>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
