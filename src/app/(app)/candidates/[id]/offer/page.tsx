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
import { ApprovalChainStatus } from '@/components/offer/ApprovalChainStatus';
import { createOrUpdateOffer, generateOfferPdf, submitOfferForApproval, sendOfferToCandidate } from '@/lib/actions/offer.actions';
import { approveOrRejectStep } from '@/lib/actions/approval.actions';
import { formatCurrency } from '@/lib/utils';
import { FileText, Send, CheckCircle, XCircle } from 'lucide-react';

const schema = z.object({
  offeredSalary:  z.coerce.number().min(1, 'Salary required'),
  currency:       z.string().default('USD'),
  outsideBand:    z.boolean().default(false),
  contractType:   z.string().optional(),
  location:       z.string().optional(),
  startDate:      z.string().optional(),
  benefits:       z.string().optional(),
  additionalNotes:z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface OfferData {
  id: string;
  status: string;
  offeredSalary?: number;
  currency: string;
  startDate?: string;
  contractType?: string;
  location?: string;
  benefits?: string;
  additionalNotes?: string;
  outsideBand: boolean;
  offerLetterPath?: string;
  approvals: { id: string; step: string; stepOrder: number; status: string; comments?: string; decidedAt?: string; approver?: { fullName: string } | null }[];
  response?: { action: string; counterSalary?: number; candidateNote?: string } | null;
}

interface CandidateData { fullName: string; appliedRoleTitle: string; email: string; }

export default function OfferPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { currency: 'USD' },
  });

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/offer`).then((r) => r.json()).then((d) => {
      setCandidate(d.candidate);
      setOffer(d.offer);
      if (d.offer) {
        reset({
          offeredSalary: d.offer.offeredSalary,
          currency: d.offer.currency,
          outsideBand: d.offer.outsideBand,
          contractType: d.offer.contractType,
          location: d.offer.location,
          startDate: d.offer.startDate ? new Date(d.offer.startDate).toISOString().split('T')[0] : undefined,
          benefits: d.offer.benefits,
          additionalNotes: d.offer.additionalNotes,
        });
      }
    });
  }, [candidateId, reset]);

  const onSave = async (data: FormData) => {
    setLoading(true);
    const result = await createOrUpdateOffer({
      candidateId,
      offeredSalary: data.offeredSalary,
      currency: data.currency,
      outsideBand: data.outsideBand,
      contractType: data.contractType,
      location: data.location,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      benefits: data.benefits,
      additionalNotes: data.additionalNotes,
    });
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Offer saved!'); window.location.reload(); }
  };

  const handleGeneratePdf = async () => {
    if (!offer) return;
    setActionLoading('pdf');
    const result = await generateOfferPdf(offer.id);
    setActionLoading(null);
    if (result.error) toast.error(result.error);
    else toast.success('PDF generated!');
  };

  const handleSubmitForApproval = async () => {
    if (!offer) return;
    setActionLoading('approval');
    const result = await submitOfferForApproval(offer.id);
    setActionLoading(null);
    if (result.error) toast.error(result.error);
    else { toast.success('Submitted for approval!'); window.location.reload(); }
  };

  const handleSendToCandidate = async () => {
    if (!offer) return;
    setActionLoading('send');
    const result = await sendOfferToCandidate(offer.id);
    setActionLoading(null);
    if (result.error) toast.error(result.error);
    else { toast.success('Offer sent to candidate!'); window.location.reload(); }
  };

  const handleApprove = async (approvalId: string) => {
    setActionLoading(approvalId);
    const result = await approveOrRejectStep(approvalId, 'approved');
    setActionLoading(null);
    if (result.error) toast.error(result.error);
    else { toast.success('Approved!'); window.location.reload(); }
  };

  const handleReject = async (approvalId: string) => {
    setActionLoading(approvalId + '-reject');
    const result = await approveOrRejectStep(approvalId, 'rejected', 'Rejected');
    setActionLoading(null);
    if (result.error) toast.error(result.error);
    else { toast.success('Step rejected'); window.location.reload(); }
  };

  return (
    <div className="p-8 max-w-4xl">
      <PageHeader
        title="Offer Management"
        subtitle={candidate ? `${candidate.fullName} — ${candidate.appliedRoleTitle}` : 'Loading...'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Form */}
        <ScrollReveal>
          <form onSubmit={handleSubmit(onSave as never)} className="glass-card p-6 space-y-4">
            <h2 className="font-display text-xs text-violet-400 mb-2">OFFER TERMS</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Offered Salary *" type="number" placeholder="150000" {...register('offeredSalary')} error={errors.offeredSalary?.message} />
              <Select label="Currency" options={['USD','AED','SAR','GBP','EUR'].map((c) => ({ value: c, label: c }))} {...register('currency')} />
              <Input label="Start Date" type="date" {...register('startDate')} className="col-span-2" />
              <Select label="Contract Type" options={[
                { value: 'Full-Time', label: 'Full-Time' },
                { value: 'Part-Time', label: 'Part-Time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Permanent', label: 'Permanent' },
              ]} placeholder="Select type" {...register('contractType')} />
              <Input label="Location" placeholder="Dubai, UAE" {...register('location')} />
            </div>
            <Textarea label="Benefits" placeholder="Health insurance, Housing allowance, Annual flights..." rows={3} {...register('benefits')} />
            <Textarea label="Additional Notes" rows={2} {...register('additionalNotes')} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="outsideBand" className="accent-violet-500" {...register('outsideBand')} />
              <label htmlFor="outsideBand" className="text-xs text-slate-400">Outside salary band (requires Finance approval)</label>
            </div>
            <Button type="submit" loading={loading} className="w-full">Save Offer</Button>
          </form>
        </ScrollReveal>

        {/* Actions Panel */}
        {offer && (
          <ScrollReveal delay={0.1}>
            <div className="space-y-4">
              {/* Status */}
              <div className="glass-card p-4">
                <h2 className="font-display text-xs text-violet-400 mb-3">OFFER STATUS</h2>
                <div className="text-sm font-medium text-slate-200 capitalize mb-2">
                  {offer.status.replace(/_/g, ' ')}
                </div>
                {offer.offeredSalary && (
                  <div className="text-xs text-slate-500">
                    {formatCurrency(offer.offeredSalary, offer.currency)} offered
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="glass-card p-4 space-y-3">
                <h2 className="font-display text-xs text-violet-400 mb-3">ACTIONS</h2>
                <Button variant="outline" onClick={handleGeneratePdf} loading={actionLoading === 'pdf'} className="w-full justify-start">
                  <FileText size={14} />
                  Generate PDF Letter
                </Button>
                {offer.offerLetterPath && (
                  <a href={`/api/files/${offer.offerLetterPath}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-violet-400 hover:text-violet-300 block">
                    View Generated PDF →
                  </a>
                )}
                {offer.status === 'draft' && (
                  <Button onClick={handleSubmitForApproval} loading={actionLoading === 'approval'} className="w-full justify-start">
                    Submit for Approval
                  </Button>
                )}
                {(offer.status === 'offer_approved' || offer.status === 'approved') && (
                  <Button onClick={handleSendToCandidate} loading={actionLoading === 'send'} className="w-full justify-start">
                    <Send size={14} />
                    Send to Candidate
                  </Button>
                )}
              </div>

              {/* Approval Chain */}
              {offer.approvals.length > 0 && (
                <div className="glass-card p-4">
                  <h2 className="font-display text-xs text-violet-400 mb-4">APPROVAL CHAIN</h2>
                  <ApprovalChainStatus approvals={offer.approvals as never} />
                  <div className="mt-4 space-y-2">
                    {offer.approvals.filter((a) => a.status === 'pending').map((approval) => (
                      <div key={approval.id} className="flex items-center gap-2 p-2 bg-violet-500/5 rounded-lg border border-violet-500/20">
                        <span className="text-xs text-violet-400 flex-1">{approval.step.replace(/_/g, ' ')} approval pending</span>
                        <Button size="sm" variant="ghost" onClick={() => handleApprove(approval.id)} loading={actionLoading === approval.id}>
                          <CheckCircle size={14} className="text-green-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReject(approval.id)} loading={actionLoading === approval.id + '-reject'}>
                          <XCircle size={14} className="text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Response */}
              {offer.response && (
                <div className={`glass-card p-4 border ${
                  offer.response.action === 'accept' ? 'border-green-500/30' :
                  offer.response.action === 'decline' ? 'border-red-500/30' : 'border-violet-500/30'
                }`}>
                  <h2 className="font-display text-xs text-violet-400 mb-2">CANDIDATE RESPONSE</h2>
                  <div className={`font-semibold capitalize ${
                    offer.response.action === 'accept' ? 'text-green-400' :
                    offer.response.action === 'decline' ? 'text-red-400' : 'text-violet-400'
                  }`}>
                    {offer.response.action}ed
                  </div>
                  {offer.response.counterSalary && (
                    <div className="text-xs text-slate-400 mt-1">
                      Counter offer: {formatCurrency(offer.response.counterSalary, offer.currency)}
                    </div>
                  )}
                  {offer.response.candidateNote && (
                    <p className="text-xs text-slate-400 mt-2">{offer.response.candidateNote}</p>
                  )}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
