'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { submitCvReview, assignCvReview } from '@/lib/actions/review.actions';

const schema = z.object({
  scoreTechnical:  z.coerce.number().min(1).max(10),
  scoreExperience: z.coerce.number().min(1).max(10),
  scoreCulture:    z.coerce.number().min(1).max(10),
  decision:        z.enum(['shortlist', 'reject', 'hold']),
  comments:        z.string().min(10, 'Please provide detailed comments'),
});

type FormData = z.infer<typeof schema>;

interface CandidateData {
  fullName: string;
  appliedRoleTitle: string;
  email: string;
  currentEmployer?: string;
  cvReviews: { id: string; reviewerId: string }[];
}

interface ProfileData {
  id: string;
  fullName: string;
  title?: string;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [myReviewId, setMyReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
  });

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/data`)
      .then((r) => r.json())
      .then((data) => {
        setCandidate(data.candidate);
        setProfiles(data.profiles ?? []);
        setMyReviewId(data.myReviewId ?? null);
      });
  }, [candidateId]);

  const handleAssign = async () => {
    if (!selectedReviewer) return;
    setAssigning(true);
    const result = await assignCvReview(candidateId, selectedReviewer);
    setAssigning(false);
    if (result.error) toast.error(result.error);
    else toast.success('Reviewer assigned!');
  };

  const onSubmit = async (data: FormData) => {
    if (!myReviewId) { toast.error('No review assigned to you'); return; }
    setLoading(true);
    const result = await submitCvReview({ reviewId: myReviewId, ...data });
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Review submitted!'); router.push(`/candidates/${candidateId}`); }
  };

  const ScoreSlider = ({ name, label }: { name: keyof FormData; label: string }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        type="range" min="1" max="10" defaultValue="5"
        className="w-full accent-amber-500"
        {...register(name)}
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>1 — Poor</span><span>5 — Average</span><span>10 — Excellent</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="CV Review"
        subtitle={candidate ? `${candidate.fullName} — ${candidate.appliedRoleTitle}` : 'Loading...'}
      />

      {/* Assign Reviewer */}
      <ScrollReveal className="glass-card p-6 mb-6">
        <h2 className="font-display text-xs text-amber-400 mb-4">ASSIGN REVIEWER</h2>
        <div className="flex gap-3">
          <Select
            options={profiles.map((p) => ({ value: p.id, label: `${p.fullName}${p.title ? ` — ${p.title}` : ''}` }))}
            placeholder="Select reviewer"
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAssign} loading={assigning} disabled={!selectedReviewer} size="sm">
            Assign
          </Button>
        </div>
      </ScrollReveal>

      {/* Submit Review */}
      <ScrollReveal>
        <form onSubmit={handleSubmit(onSubmit as never)} className="glass-card p-6 space-y-6">
          <h2 className="font-display text-xs text-amber-400 mb-4">SUBMIT SCORECARD</h2>

          <ScoreSlider name="scoreTechnical" label="Technical Skills (1–10)" />
          <ScoreSlider name="scoreExperience" label="Experience Level (1–10)" />
          <ScoreSlider name="scoreCulture" label="Culture Fit (1–10)" />

          <Select
            label="Decision *"
            options={[
              { value: 'shortlist', label: '✅ Shortlist — Move forward' },
              { value: 'hold', label: '⏸ Hold — Undecided' },
              { value: 'reject', label: '❌ Reject — Not suitable' },
            ]}
            placeholder="Select decision"
            error={errors.decision?.message}
            {...register('decision')}
          />

          <Textarea
            label="Comments *"
            placeholder="Provide detailed feedback on the candidate's suitability, strengths, and concerns..."
            rows={5}
            error={errors.comments?.message}
            {...register('comments')}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Submit Review</Button>
          </div>
        </form>
      </ScrollReveal>
    </div>
  );
}
