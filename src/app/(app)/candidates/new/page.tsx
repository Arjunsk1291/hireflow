'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createCandidate } from '@/lib/actions/candidate.actions';
import { Upload, FileText, User, Briefcase, ChevronRight } from 'lucide-react';

const schema = z.object({
  fullName:         z.string().min(2, 'Full name required'),
  email:            z.string().email('Valid email required'),
  phone:            z.string().optional(),
  nationality:      z.string().optional(),
  currentLocation:  z.string().optional(),
  currentTitle:     z.string().optional(),
  currentEmployer:  z.string().optional(),
  yearsExperience:  z.coerce.number().optional(),
  linkedinUrl:      z.string().optional(),
  source:           z.string().optional(),
  appliedRoleTitle: z.string().min(2, 'Role title required'),
  expectedSalary:   z.coerce.number().optional(),
  currency:         z.string().default('USD'),
  notes:            z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Basic Info', 'Role & Salary', 'Notes & CV'];

export default function NewCandidatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPath, setCvPath] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: { currency: 'USD' },
  });

  const handleCvUpload = async (file: File) => {
    setUploading(true);
    setCvFile(file);
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const res = await fetch('/api/cv/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.filePath) setCvPath(data.filePath);
      else toast.error('CV upload failed');
    } catch {
      toast.error('CV upload failed');
    } finally {
      setUploading(false);
    }
  };

  const next = async () => {
    const fields: (keyof FormData)[][] = [
      ['fullName', 'email', 'phone', 'nationality', 'currentLocation'],
      ['appliedRoleTitle', 'currentTitle', 'currentEmployer', 'yearsExperience', 'source'],
      [],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await createCandidate({ ...data, cvFilePath: cvPath || undefined, tags: [] });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Candidate added successfully!');
      router.push(`/candidates/${result.data!.id}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Add New Candidate"
        subtitle="Submit a candidate to the hiring pipeline"
      />

      {/* Step Indicator */}
      <ScrollReveal className="glass-card p-4 mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? 'text-amber-400' : i < step ? 'text-green-400' : 'text-slate-600'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${
                  i === step ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                  i < step   ? 'bg-green-500/20 border-green-500/40 text-green-400' :
                               'border-white/10 text-slate-600'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-green-500/40' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>
      </ScrollReveal>

      <form onSubmit={handleSubmit(onSubmit as never)}>
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <ScrollReveal className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <User size={18} className="text-amber-400" />
                <h2 className="font-semibold text-slate-200">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name *" placeholder="Ahmed Al-Rashid" {...register('fullName')} error={errors.fullName?.message} />
                <Input label="Email *" type="email" placeholder="ahmed@example.com" {...register('email')} error={errors.email?.message} />
                <Input label="Phone" placeholder="+971 50 123 4567" {...register('phone')} />
                <Input label="Nationality" placeholder="UAE" {...register('nationality')} />
                <Input label="Current Location" placeholder="Dubai, UAE" {...register('currentLocation')} />
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Step 1: Role & Salary */}
        {step === 1 && (
          <ScrollReveal className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase size={18} className="text-amber-400" />
                <h2 className="font-semibold text-slate-200">Role & Experience</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Applied Role *" placeholder="Senior Petroleum Engineer" {...register('appliedRoleTitle')} error={errors.appliedRoleTitle?.message} className="sm:col-span-2" />
                <Input label="Current Title" placeholder="Petroleum Engineer" {...register('currentTitle')} />
                <Input label="Current Employer" placeholder="Shell" {...register('currentEmployer')} />
                <Input label="Years Experience" type="number" placeholder="8" {...register('yearsExperience')} />
                <Select
                  label="Source"
                  options={[
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'referral', label: 'Referral' },
                    { value: 'portal', label: 'Job Portal' },
                    { value: 'agency', label: 'Agency' },
                    { value: 'direct', label: 'Direct Application' },
                  ]}
                  placeholder="Select source"
                  {...register('source')}
                />
                <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register('linkedinUrl')} />
                <Input label="Expected Salary" type="number" placeholder="150000" {...register('expectedSalary')} />
                <Select
                  label="Currency"
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'AED', label: 'AED' },
                    { value: 'SAR', label: 'SAR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                  {...register('currency')}
                />
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Step 2: Notes & CV */}
        {step === 2 && (
          <ScrollReveal className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-amber-400" />
                <h2 className="font-semibold text-slate-200">CV & Notes</h2>
              </div>

              {/* CV Upload */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  CV Document
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    cvFile ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5'
                  }`}
                  onClick={() => document.getElementById('cv-input')?.click()}
                >
                  <input
                    id="cv-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); }}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400">
                      <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Uploading CV...</span>
                    </div>
                  ) : cvFile ? (
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <FileText size={32} />
                      <span className="text-sm font-medium">{cvFile.name}</span>
                      <span className="text-xs text-slate-500">CV uploaded successfully</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Upload size={32} />
                      <span className="text-sm">Drop CV here or click to upload</span>
                      <span className="text-xs">PDF, DOC, DOCX — max 15MB</span>
                    </div>
                  )}
                </div>
              </div>

              <Textarea label="Notes" placeholder="Additional notes about this candidate..." rows={4} {...register('notes')} />
            </div>
          </ScrollReveal>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit" loading={loading}>
              Add Candidate
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
