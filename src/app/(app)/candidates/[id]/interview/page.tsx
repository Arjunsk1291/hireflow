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
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { scheduleInterview } from '@/lib/actions/interview.actions';

const schema = z.object({
  roundName:      z.string().min(1, 'Round name required'),
  roundNumber:    z.coerce.number().min(1),
  mode:           z.enum(['teams', 'in_person', 'phone']),
  scheduledAt:    z.string().min(1, 'Schedule time required'),
  durationMins:   z.coerce.number().min(15),
  location:       z.string().optional(),
  notes:          z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Profile { id: string; fullName: string; title?: string; }

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedPanelists, setSelectedPanelists] = useState<string[]>([]);
  const [leadId, setLeadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<{ fullName: string; appliedRoleTitle: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { roundNumber: 1, mode: 'teams', durationMins: 60, roundName: 'Technical Interview' },
  });

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/data`).then((r) => r.json()).then((d) => {
      setProfiles(d.profiles ?? []);
      setCandidate(d.candidate);
    });
  }, [candidateId]);

  const togglePanelist = (id: string) => {
    setSelectedPanelists((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (selectedPanelists.length === 0) { toast.error('Select at least one panelist'); return; }
    if (!leadId) { toast.error('Select a panel lead'); return; }
    setLoading(true);
    const result = await scheduleInterview({
      candidateId,
      roundNumber: data.roundNumber,
      roundName: data.roundName,
      mode: data.mode,
      scheduledAt: new Date(data.scheduledAt),
      durationMins: data.durationMins,
      panelIds: selectedPanelists,
      leadPanelistId: leadId,
      location: data.location,
      notes: data.notes,
    });
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Interview scheduled! Invites sent.'); router.push(`/candidates/${candidateId}`); }
  };

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Schedule Interview"
        subtitle={candidate ? `${candidate.fullName} — ${candidate.appliedRoleTitle}` : 'Loading...'}
      />

      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-6">
        <ScrollReveal>
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-display text-xs text-violet-400">ROUND DETAILS</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Round Name *" placeholder="Technical Interview" {...register('roundName')} error={errors.roundName?.message} className="col-span-2" />
              <Input label="Round Number" type="number" {...register('roundNumber')} />
              <Select label="Mode" options={[
                { value: 'teams', label: 'Microsoft Teams' },
                { value: 'in_person', label: 'In Person' },
                { value: 'phone', label: 'Phone' },
              ]} {...register('mode')} />
              <Input label="Scheduled At *" type="datetime-local" {...register('scheduledAt')} error={errors.scheduledAt?.message} />
              <Input label="Duration (mins)" type="number" {...register('durationMins')} />
              <Input label="Location / Room" placeholder="Conference Room A" {...register('location')} className="col-span-2" />
            </div>
            <Textarea label="Notes" placeholder="Interview focus areas, instructions..." rows={3} {...register('notes')} />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card p-6">
            <h2 className="font-display text-xs text-violet-400 mb-4">INTERVIEW PANEL</h2>
            <p className="text-xs text-slate-500 mb-4">Select panelists and designate a lead</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPanelists.includes(p.id)}
                      onChange={() => togglePanelist(p.id)}
                      className="accent-violet-500"
                    />
                    <Avatar name={p.fullName} size="sm" />
                    <div>
                      <div className="text-sm text-slate-200">{p.fullName}</div>
                      {p.title && <div className="text-xs text-slate-500">{p.title}</div>}
                    </div>
                  </div>
                  {selectedPanelists.includes(p.id) && (
                    <button
                      type="button"
                      onClick={() => setLeadId(p.id)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        leadId === p.id ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-violet-400'
                      }`}
                    >
                      {leadId === p.id ? '★ Lead' : 'Set Lead'}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {selectedPanelists.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">{selectedPanelists.length} panelist(s) selected</p>
            )}
          </div>
        </ScrollReveal>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Schedule & Send Invites
          </Button>
        </div>
      </form>
    </div>
  );
}
