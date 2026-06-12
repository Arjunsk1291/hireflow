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
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { submitInterviewFeedback } from '@/lib/actions/interview.actions';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  interviewId:       z.string().min(1, 'Select an interview round'),
  recommendation:    z.enum(['strong_hire', 'hire', 'no_hire', 'strong_no_hire']),
  scoreTechnical:    z.coerce.number().min(1).max(10),
  scoreCommunication:z.coerce.number().min(1).max(10),
  scoreProblemSolving: z.coerce.number().min(1).max(10),
  scoreCultureFit:   z.coerce.number().min(1).max(10),
  scoreDomainKnowledge: z.coerce.number().min(1).max(10),
  strengths:         z.string().min(5, 'Required'),
  concerns:          z.string().optional().default(''),
  detailedNotes:     z.string().min(10, 'Provide detailed feedback'),
});

type FormData = z.infer<typeof schema>;

interface Interview {
  id: string;
  roundName?: string;
  roundNumber: number;
  status: string;
  scheduledAt?: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidate, setCandidate] = useState<{ fullName: string; appliedRoleTitle: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      scoreTechnical: 5,
      scoreCommunication: 5,
      scoreProblemSolving: 5,
      scoreCultureFit: 5,
      scoreDomainKnowledge: 5,
    },
  });

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/data`).then((r) => r.json()).then((d) => {
      setCandidate(d.candidate);
      setInterviews(d.candidate?.interviews ?? []);
    });
  }, [candidateId]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await submitInterviewFeedback({
      interviewId: data.interviewId,
      recommendation: data.recommendation,
      scoreTechnical: data.scoreTechnical,
      scoreCommunication: data.scoreCommunication,
      scoreProblemSolving: data.scoreProblemSolving,
      scoreCultureFit: data.scoreCultureFit,
      scoreDomainKnowledge: data.scoreDomainKnowledge,
      strengths: data.strengths,
      concerns: data.concerns ?? '',
      detailedNotes: data.detailedNotes,
    });
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Feedback submitted!'); router.push(`/candidates/${candidateId}`); }
  };

  const ScoreSlider = ({ name, label }: { name: keyof FormData; label: string }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <input type="range" min="1" max="10" className="w-full accent-amber-500" {...register(name)} />
      <div className="flex justify-between text-xs text-slate-600"><span>1</span><span>5</span><span>10</span></div>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Interview Feedback"
        subtitle={candidate ? `${candidate.fullName} — ${candidate.appliedRoleTitle}` : 'Loading...'}
      />

      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-6">
        <ScrollReveal>
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-display text-xs text-amber-400 mb-4">SELECT INTERVIEW ROUND</h2>
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-500">No interviews scheduled for this candidate.</p>
            ) : (
              <div className="space-y-2">
                {interviews.map((interview) => (
                  <label key={interview.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 cursor-pointer transition-colors border border-white/5">
                    <input type="radio" value={interview.id} {...register('interviewId')} className="accent-amber-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">
                          {interview.roundName ?? `Round ${interview.roundNumber}`}
                        </span>
                        <Badge variant={interview.status === 'completed' ? 'green' : 'amber'}>
                          {interview.status}
                        </Badge>
                      </div>
                      {interview.scheduledAt && (
                        <span className="text-xs text-slate-500">{formatDate(interview.scheduledAt)}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.interviewId && <p className="text-xs text-red-400">{errors.interviewId.message}</p>}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6 space-y-5">
            <h2 className="font-display text-xs text-amber-400 mb-4">SCORECARD</h2>
            <ScoreSlider name="scoreTechnical" label="Technical Skills" />
            <ScoreSlider name="scoreCommunication" label="Communication" />
            <ScoreSlider name="scoreProblemSolving" label="Problem Solving" />
            <ScoreSlider name="scoreCultureFit" label="Culture Fit" />
            <ScoreSlider name="scoreDomainKnowledge" label="Domain Knowledge" />

            <Select
              label="Recommendation *"
              options={[
                { value: 'strong_hire', label: '⭐ Strong Hire' },
                { value: 'hire', label: '✅ Hire — Yes' },
                { value: 'no_hire', label: '❌ No Hire — Not suitable' },
                { value: 'strong_no_hire', label: '🚫 Strong No Hire' },
              ]}
              placeholder="Select recommendation"
              error={errors.recommendation?.message}
              {...register('recommendation')}
            />

            <Textarea
              label="Strengths *"
              placeholder="Key strengths observed..."
              rows={3}
              error={errors.strengths?.message}
              {...register('strengths')}
            />
            <Textarea
              label="Concerns"
              placeholder="Any areas of concern..."
              rows={2}
              {...register('concerns')}
            />
            <Textarea
              label="Detailed Notes *"
              placeholder="Full interview notes, specific examples, context..."
              rows={5}
              error={errors.detailedNotes?.message}
              {...register('detailedNotes')}
            />
          </div>
        </ScrollReveal>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>Submit Feedback</Button>
        </div>
      </form>
    </div>
  );
}
