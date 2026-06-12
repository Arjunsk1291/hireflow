'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, MessageSquare, Building2, Loader } from 'lucide-react';

interface OfferPortal {
  id: string;
  offeredSalary: number;
  currency: string;
  startDate?: string;
  contractType?: string;
  location?: string;
  benefits?: string;
  additionalNotes?: string;
  offerLetterPath?: string;
  candidate: { fullName: string; appliedRoleTitle: string; email: string };
  response?: { action: string } | null;
}

export default function CandidatePortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [offer, setOffer] = useState<OfferPortal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [action, setAction] = useState<'accept' | 'decline' | 'negotiate' | null>(null);
  const [counterSalary, setCounterSalary] = useState('');
  const [candidateNote, setCandidateNote] = useState('');

  useEffect(() => {
    fetch(`/api/portal/get?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setOffer(d.offer);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async () => {
    if (!action) return;
    setSubmitting(true);
    const res = await fetch('/api/portal/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        action,
        counterSalary: counterSalary ? Number(counterSalary) : undefined,
        candidateNote,
      }),
    });
    setSubmitting(false);
    if (res.ok) setDone(true);
    else setError('Failed to submit response. Please try again.');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <Loader className="animate-spin text-amber-500" size={32} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-200 mb-2">Link Expired or Invalid</h1>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 max-w-md"
      >
        <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Response Received</h1>
        <p className="text-slate-400">Thank you, {offer?.candidate.fullName}. We will be in touch shortly.</p>
      </motion.div>
    </div>
  );

  if (offer?.response) return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <CheckCircle size={48} className="text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-200 mb-2">Already Responded</h1>
        <p className="text-slate-500 text-sm">You have already submitted your response ({offer.response.action}). Contact HR if you need to update it.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050b14] py-12 px-4">
      {/* Blueprint Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(#6b7280 1px, transparent 1px), linear-gradient(90deg, #6b7280 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Building2 size={24} className="text-amber-500" />
            <span className="text-lg font-bold text-slate-200">Avenir International Engineers</span>
          </div>
          <p className="text-slate-500 text-sm">Confidential Offer Letter</p>
        </motion.div>

        {/* Offer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 mb-6"
        >
          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            Dear {offer?.candidate.fullName},
          </h1>
          <p className="text-slate-400 mb-6">
            We are pleased to extend the following offer for the position of{' '}
            <span className="text-amber-400 font-medium">{offer?.candidate.appliedRoleTitle}</span>.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Offered Compensation</p>
              <p className="text-3xl font-bold text-amber-400">
                {formatCurrency(offer?.offeredSalary ?? 0, offer?.currency ?? 'USD')}
              </p>
              <p className="text-xs text-slate-500 mt-1">per annum · {offer?.contractType ?? 'Permanent'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {offer?.startDate && (
                <div className="p-3 bg-white/3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Start Date</p>
                  <p className="text-sm font-medium text-slate-200">{formatDate(offer.startDate)}</p>
                </div>
              )}
              {offer?.location && (
                <div className="p-3 bg-white/3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Location</p>
                  <p className="text-sm font-medium text-slate-200">{offer.location}</p>
                </div>
              )}
            </div>

            {offer?.benefits && (
              <div className="p-3 bg-white/3 rounded-lg">
                <p className="text-xs text-slate-500 mb-2">Benefits Package</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{offer.benefits}</p>
              </div>
            )}

            {offer?.additionalNotes && (
              <div className="p-3 bg-white/3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Additional Notes</p>
                <p className="text-sm text-slate-400">{offer.additionalNotes}</p>
              </div>
            )}

            {offer?.offerLetterPath && (
              <a
                href={`/api/files/${offer.offerLetterPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Download Full Offer Letter PDF →
              </a>
            )}
          </div>
        </motion.div>

        {/* Response Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="font-display text-xs text-amber-400 mb-4">YOUR RESPONSE</h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { value: 'accept', icon: CheckCircle, label: 'Accept', color: 'border-green-500/30 text-green-400 hover:bg-green-500/10' },
              { value: 'decline', icon: XCircle, label: 'Decline', color: 'border-red-500/30 text-red-400 hover:bg-red-500/10' },
              { value: 'negotiate', icon: MessageSquare, label: 'Negotiate', color: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' },
            ].map(({ value, icon: Icon, label, color }) => (
              <button
                key={value}
                onClick={() => setAction(value as typeof action)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${color} ${
                  action === value ? 'opacity-100 ring-1 ring-current' : 'opacity-70 border-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          {action === 'negotiate' && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Counter Salary (optional)</label>
                <input
                  type="number"
                  value={counterSalary}
                  onChange={(e) => setCounterSalary(e.target.value)}
                  placeholder="Your expected salary"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          {action && (
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-1">Message to HR (optional)</label>
              <textarea
                value={candidateNote}
                onChange={(e) => setCandidateNote(e.target.value)}
                placeholder="Any comments or questions..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!action || submitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-black transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </motion.div>

        <p className="text-center text-xs text-slate-600 mt-6">
          This offer is confidential and intended only for {offer?.candidate.email}
        </p>
      </div>
    </div>
  );
}
