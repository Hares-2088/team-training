'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role?: string;
};

type TeamOption = {
  _id: string;
  name: string;
  trainer?: TeamMember;
  members?: TeamMember[];
};

type GenerateAITrainingFormProps = {
  onSuccess: (planId: string) => void;
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function GenerateAITrainingForm({ onSuccess }: Readonly<GenerateAITrainingFormProps>) {
  const { user, activeTeam } = useAuth();
  const effectiveRole = activeTeam.role || user?.role || 'member';
  const canManage = effectiveRole === 'trainer' || effectiveRole === 'coach';

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamId, setTeamId] = useState(activeTeam.teamId || '');
  const [targetUserId, setTargetUserId] = useState(user?._id || '');
  const [title, setTitle] = useState('AI Training Plan');
  const [goalSummary, setGoalSummary] = useState('');
  const [weeks, setWeeks] = useState('4');
  const [availability, setAvailability] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [preferences, setPreferences] = useState('');
  const [injuries, setInjuries] = useState('');
  const [notes, setNotes] = useState('');
  const [isPersonal, setIsPersonal] = useState(!canManage);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [imageNote, setImageNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams', { credentials: 'include' });
        if (!response.ok) return;
        const payload = (await response.json()) as TeamOption[];
        setTeams(Array.isArray(payload) ? payload : []);
      } catch {
        // ignore fetch errors in form bootstrap
      }
    };

    void fetchTeams();
  }, []);

  useEffect(() => {
    if (!teamId) {
      if (activeTeam.teamId) {
        setTeamId(activeTeam.teamId);
      } else if (teams[0]?._id) {
        setTeamId(teams[0]._id);
      }
    }
  }, [activeTeam.teamId, teamId, teams]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team._id === teamId) || null,
    [teamId, teams]
  );

  const userOptions = useMemo(() => {
    if (!selectedTeam) return [] as TeamMember[];

    const combined = [selectedTeam.trainer, ...(selectedTeam.members || [])].filter(
      (member): member is TeamMember => Boolean(member && member._id)
    );
    const byId = new Map<string, TeamMember>();
    combined.forEach((member) => {
      if (!byId.has(member._id)) {
        byId.set(member._id, member);
      }
    });
    return [...byId.values()];
  }, [selectedTeam]);

  useEffect(() => {
    if (!user?._id) return;
    if (!canManage) {
      setTargetUserId(user._id);
      setIsPersonal(true);
      return;
    }
    if (!targetUserId && userOptions[0]?._id) {
      setTargetUserId(userOptions[0]._id);
    }
  }, [canManage, targetUserId, user?._id, userOptions]);

  const toggleAvailability = (day: string) => {
    setAvailability((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const uploadImages = async (userId: string) => {
    const uploadedImageIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('teamId', teamId);
      formData.append('file', file);
      if (imageNote.trim()) {
        formData.append('note', imageNote.trim());
      }

      const response = await fetch(`/api/users/${userId}/progress-images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to upload progress image');
      }

      const payload = (await response.json()) as { image?: { _id?: string } };
      if (payload.image?._id) {
        uploadedImageIds.push(payload.image._id);
      }
    }

    return uploadedImageIds;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!teamId) {
      setError('Select a team first.');
      return;
    }
    if (!targetUserId) {
      setError('Select a trainee first.');
      return;
    }
    if (!title.trim()) {
      setError('Plan title is required.');
      return;
    }
    if (aiEnabled) {
      if (!goalSummary.trim()) {
        setError('Goal summary is required when AI is enabled.');
        return;
      }
      if (availability.length === 0) {
        setError('Select at least one available training day.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (!aiEnabled) {
        const response = await fetch('/api/plans', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: notes.trim(),
            team: teamId,
            isPersonal,
            assignee: canManage ? targetUserId : undefined,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error || 'Failed to create plan');
        }

        const payload = (await response.json()) as { plan?: { _id?: string } };
        if (!payload.plan?._id) {
          throw new Error('Created plan is missing an id');
        }

        onSuccess(payload.plan._id);
        return;
      }

      const uploadedImageIds = await uploadImages(targetUserId);
      const response = await fetch('/api/ai/training/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          targetUserId,
          title: title.trim(),
          goalSummary: goalSummary.trim(),
          availability,
          weeks: Number(weeks) || 4,
          preferences: preferences.trim(),
          injuries: injuries.trim(),
          notes: notes.trim(),
          isPersonal,
          uploadedImageIds,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to generate AI plan');
      }

      const payload = (await response.json()) as { plan?: { _id?: string } };
      if (!payload.plan?._id) {
        throw new Error('Generated plan is missing an id');
      }

      onSuccess(payload.plan._id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to generate AI plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Generate Training</CardTitle>
          <Button
            type="button"
            variant={aiEnabled ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setAiEnabled((current) => !current)}
          >
            <Sparkles className="h-4 w-4" />
            AI
          </Button>
        </div>
        <CardDescription>
          {aiEnabled
            ? 'Build a structured plan from goals, availability, feedback, and optional progress images.'
            : 'Create a plan shell now and add workouts later from your library.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="ai-plan-title">Plan Title</Label>
              <Input
                id="ai-plan-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2"
                placeholder="e.g. 6 Week Strength Reset"
                required
              />
            </div>
            <div>
              <Label htmlFor="ai-weeks">Plan Length (weeks)</Label>
              <Input
                id="ai-weeks"
                type="number"
                min={1}
                max={12}
                value={weeks}
                onChange={(event) => setWeeks(event.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="mt-2">
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
              <Label>Trainee</Label>
              <Select value={targetUserId} onValueChange={setTargetUserId} disabled={!canManage}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a trainee" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name} {member.role ? `(${member.role})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <input
                id="is-personal"
                type="checkbox"
                className="h-4 w-4"
                checked={isPersonal}
                onChange={(event) => setIsPersonal(event.target.checked)}
                disabled={!canManage}
              />
              <Label htmlFor="is-personal">Keep this as a personal plan visible only to the assignee and coaches</Label>
            </div>
          </div>

          {aiEnabled ? (
            <>
              <div>
                <Label htmlFor="goal-summary">Goal Summary</Label>
                <Textarea
                  id="goal-summary"
                  value={goalSummary}
                  onChange={(event) => setGoalSummary(event.target.value)}
                  className="mt-2"
                  rows={4}
                  placeholder="What outcome should this plan target?"
                  required={aiEnabled}
                />
              </div>

              <div>
                <Label>Availability</Label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={availability.includes(day)}
                        onChange={() => toggleAvailability(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="preferences">Preferences</Label>
                  <Textarea
                    id="preferences"
                    value={preferences}
                    onChange={(event) => setPreferences(event.target.value)}
                    className="mt-2"
                    rows={4}
                    placeholder="Preferred training style, equipment, cardio, split, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="injuries">Injuries or Restrictions</Label>
                  <Textarea
                    id="injuries"
                    value={injuries}
                    onChange={(event) => setInjuries(event.target.value)}
                    className="mt-2"
                    rows={4}
                    placeholder="Any current pain points, limitations, or movements to avoid"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Coach Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2"
                  rows={4}
                  placeholder="Anything else the generator should account for"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="progress-images">Optional Progress Images</Label>
                  <Input
                    id="progress-images"
                    type="file"
                    className="mt-2"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files || []))}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Stored on the authenticated backend only and reused for this generation request.
                  </p>
                </div>
                <div>
                  <Label htmlFor="image-note">Image Note</Label>
                  <Textarea
                    id="image-note"
                    value={imageNote}
                    onChange={(event) => setImageNote(event.target.value)}
                    className="mt-2"
                    rows={4}
                    placeholder="Optional context for uploaded images"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="notes">Plan Description (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2"
                rows={4}
                placeholder="Add a note for this plan"
              />
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : aiEnabled ? 'Generate Training' : 'Create Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
