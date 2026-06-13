'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DEMO_USERS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ROLES = [
  { key: 'master',       ...DEMO_USERS.master,        desc: 'Full system access',  initials: 'MA' },
  { key: 'hr_admin',     ...DEMO_USERS.hr_admin,      desc: 'Pipeline control',    initials: 'HR' },
  { key: 'svp',          ...DEMO_USERS.svp,           desc: 'Senior approvals',    initials: 'DH' },
  { key: 'team_manager', ...DEMO_USERS.team_manager,  desc: 'Team oversight',      initials: 'HO' },
  { key: 'team_lead',    ...DEMO_USERS.team_lead,     desc: 'Technical review',    initials: 'RC' },
  { key: 'interviewer',  ...DEMO_USERS.interviewer,   desc: 'Panel feedback',      initials: 'IV' },
  { key: 'finance',      ...DEMO_USERS.finance,       desc: 'Financial sign-off',  initials: 'FN' },
];

const HIGHLIGHTS = [
  'Ten-stage hiring pipeline, intake to signed offer',
  'Realtime collaboration across hiring panels',
  'Audit-grade trail on every decision',
  'Runs fully local — zero cloud dependencies',
];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('error')) setError('Invalid credentials. Please try again.');
  }, [searchParams]);

  const handleRoleLogin = async (roleKey: string, roleEmail: string) => {
    setLoading(roleKey);
    setError('');
    try {
      const result = await signIn('credentials', { email: roleEmail, password: 'Demo@2024', redirect: false });
      if (result?.error) { setError('Login failed. Please ensure the database is seeded.'); setLoading(null); }
      else router.push('/dashboard');
    } catch { setLoading(null); setError('Connection error'); }
  };

  const handleAdvancedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('advanced');
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) { setError('Invalid email or password'); setLoading(null); }
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left: brand panel (hidden on small screens) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[40%] relative overflow-hidden p-12 xl:p-16">
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(110,99,240,0.35) 0%, transparent 60%)' }}
            animate={{ y: [0, 24, 0], x: [0, 16, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.18) 0%, transparent 60%)' }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl grid place-items-center skeu-btn">
            <span className="font-display text-white text-lg">H</span>
          </div>
          <div>
            <div className="font-display text-lg text-white leading-tight">HireFlow</div>
            <div className="text-[11px] text-slate-400">Avenir International Engineers</div>
          </div>
        </motion.div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-[40px] xl:text-[46px] leading-[1.08] text-white text-balance"
          >
            Hiring, <span className="text-gradient">engineered</span> end to end.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="mt-4 text-[15px] text-slate-400 max-w-md leading-relaxed"
          >
            The internal platform for recruiting world-class oil &amp; gas engineering talent — from first CV to signed offer.
          </motion.p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.08 }}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <CheckCircle2 size={17} className="text-violet-400 shrink-0" />
                {h}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock size={12} /> All sessions are encrypted &amp; logged
        </div>
      </div>

      {/* ── Right: login ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl grid place-items-center skeu-btn">
              <span className="font-display text-white">H</span>
            </div>
            <span className="font-display text-lg text-white">HireFlow</span>
          </div>

          <div className="glass-card p-7 sm:p-8">
            <AnimatePresence mode="wait">
              {!showAdvanced ? (
                <motion.div key="roles" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <h2 className="font-display text-xl text-white">Welcome back</h2>
                  <p className="text-sm text-slate-400 mt-1 mb-6">Choose a profile to enter the workspace.</p>

                  <div className="space-y-2">
                    {ROLES.map((role) => (
                      <button
                        key={role.key}
                        onClick={() => handleRoleLogin(role.key, role.email)}
                        disabled={loading !== null}
                        className="tactile group w-full flex items-center gap-3.5 p-3 rounded-xl skeu-surface hover:border-violet-400/30 disabled:opacity-50 text-left"
                      >
                        <span className="w-10 h-10 rounded-xl grid place-items-center shrink-0 text-[13px] font-semibold text-violet-200 bg-violet-500/15 border border-violet-400/20">
                          {role.initials}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-slate-100">{role.role}</span>
                          <span className="block text-xs text-slate-500">{role.desc}</span>
                        </span>
                        {loading === role.key ? (
                          <svg className="animate-spin w-4 h-4 text-violet-300" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAdvanced(true)}
                    className="mt-5 w-full text-center text-xs text-slate-500 hover:text-violet-300 transition-colors"
                  >
                    Sign in with custom credentials →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <button onClick={() => setShowAdvanced(false)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
                    <ArrowLeft size={13} /> Back to profiles
                  </button>
                  <h2 className="font-display text-xl text-white">Sign in</h2>
                  <p className="text-sm text-slate-400 mt-1 mb-6">Enter your Avenir credentials.</p>
                  <form onSubmit={handleAdvancedLogin} className="space-y-3.5">
                    <Input label="Email" type="email" placeholder="you@avenir.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" loading={loading === 'advanced'} size="lg" className="w-full mt-2">
                      Sign in
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 py-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-600">
            <ShieldCheck size={12} /> Internal system · Avenir International Engineers
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen grid place-items-center">
        <div className="font-display text-2xl text-gradient">HireFlow</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
