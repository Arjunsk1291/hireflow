'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollReveal } from '@/components/animation/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  tenantId: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  sharedMailbox: z.string().email('Must be a valid email').optional().or(z.literal('')),
  fromName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    fetch('/api/settings/email').then((r) => r.json()).then((d) => {
      if (d.config) reset(d.config);
    });
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch('/api/settings/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) toast.success('Email settings saved!');
    else toast.error('Failed to save settings');
  };

  return (
    <div className="p-8 max-w-2xl">
      <PageHeader title="Email Configuration" subtitle="Microsoft Graph API settings for sending emails" />

      <ScrollReveal>
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
          <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-lg text-xs text-violet-400/80 mb-2">
            These settings are optional. Email features gracefully degrade when not configured.
          </div>

          <Input label="Azure Tenant ID" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...register('tenantId')} />
          <Input label="Azure Client ID (App ID)" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...register('clientId')} />
          <Input label="Azure Client Secret" type="password" placeholder="••••••••••••••••" {...register('clientSecret')} />
          <Input label="Shared Mailbox Email" type="email" placeholder="hiring@company.com" {...register('sharedMailbox')} error={errors.sharedMailbox?.message} />
          <Input label="From Display Name" placeholder="Avenir International Engineers" {...register('fromName')} />

          <Button type="submit" loading={loading} className="w-full">Save Configuration</Button>
        </form>
      </ScrollReveal>
    </div>
  );
}
