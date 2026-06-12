'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/constants';
import { DEMO_USERS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const AuthScene = dynamic(
  () => import('@/components/three/AuthScene').then((m) => ({ default: m.AuthScene })),
  { ssr: false },
);

const ROLES = [
  { key: 'master',       ...DEMO_USERS.master,        desc: 'Full system access' },
  { key: 'hr_admin',     ...DEMO_USERS.hr_admin,      desc: 'Pipeline control' },
  { key: 'svp',          ...DEMO_USERS.svp,           desc: 'Senior approvals' },
  { key: 'team_manager', ...DEMO_USERS.team_manager,  desc: 'Team oversight' },
  { key: 'team_lead',    ...DEMO_USERS.team_lead,     desc: 'Technical review' },
  { key: 'interviewer',  ...DEMO_USERS.interviewer,   desc: 'Panel feedback' },
  { key: 'finance',      ...DEMO_USERS.finance,       desc: 'Financial sign-off' },
];

const MARQUEE_ITEMS = [
  'TEN-STAGE PIPELINE', 'REALTIME COLLABORATION', 'CV INTELLIGENCE',
  'OFFER ORCHESTRATION', 'AUDIT-GRADE TRAIL', 'PANEL FEEDBACK', 'LOCAL-FIRST',
];

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-slate-500 tabular-nums">{time || '--:--:--'}</span>;
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setError('Invalid credentials. Please try again.');
  }, [searchParams]);

  const handleRoleLogin = async (roleKey: string, roleEmail: string) => {
    setLoading(roleKey);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: roleEmail,
        password: 'Demo@2024',
        redirect: false,
      });
      if (result?.error) {
        setError('Login failed. Please ensure the database is seeded.');
        setLoading(null);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setLoading(null);
      setError('Connection error');
    }
  };

  const handleAdvancedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('advanced');
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password');
      setLoading(null);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden grain vignette" style={{ background: '#04080f' }}>
      {/* 3D scene */}
      <div className="fixed inset-0">
        <Suspense fallback={null}>
          <AuthScene />
        </Suspense>
      </div>

      {/* Ambient washes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── Top bar ── */}
        <motion.header
          className="flex items-center justify-between px-6 sm:px-10 h-16 border-b border-white/6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE.outExpo }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rotate-45 bg-amber-500" style={{ boxShadow: '0 0 14px #f59e0b' }} />
            <span className="font-display text-sm text-slate-100 tracking-[0.2em]">HIREFLOW</span>
          </div>
          <div className="hidden md:block font-mono text-[10px] text-slate-600 tracking-[0.35em]">
            AVENIR INTERNATIONAL ENGINEERS
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/80 tracking-widest">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> SYSTEM LIVE
            </span>
            <LiveClock />
          </div>
        </motion.header>

        {/* ── Hero ── */}
        <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10">
          <div className="max-w-[1400px] w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE.outExpo }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="font-mono text-[10px] text-amber-400/90 tracking-[0.4em] border border-amber-500/25 bg-amber-500/5 rounded-full px-4 py-1.5">
                INTERNAL HIRING PLATFORM — v2
              </span>
            </motion.div>

            <h1 className="font-hero select-none" style={{ fontSize: 'clamp(64px, 11vw, 168px)' }}>
              <motion.span
                className="block text-slate-50"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.25, ease: EASE.outExpo }}
              >
                ENGINEER
              </motion.span>
              <motion.span
                className="block text-outline"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.38, ease: EASE.outExpo }}
              >
                THE&nbsp;<span className="text-gradient-amber" style={{ WebkitTextStroke: '0px' }}>HIRE</span>
              </motion.span>
            </h1>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <motion.p
                className="max-w-md text-sm leading-relaxed text-slate-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: EASE.outExpo }}
              >
                Ten stages. One pipeline. From CV intake to signed offer —
                orchestrated in realtime for oil &amp; gas engineering teams.
              </motion.p>

              <motion.div
                className="flex gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE.outExpo }}
              >
                {[['10', 'PIPELINE STAGES'], ['07', 'ROLE PROFILES'], ['00', 'CLOUD DEPENDENCIES']].map(([num, label]) => (
                  <div key={label}>
                    <div className="font-hero text-3xl text-gradient-amber">{num}</div>
                    <div className="font-mono text-[9px] text-slate-600 tracking-[0.25em] mt-1">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </main>

        {/* ── Marquee ── */}
        <motion.div
          className="border-y border-white/6 py-3 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="font-display text-xs text-slate-600 tracking-[0.3em] px-6">{item}</span>
                <span className="w-1.5 h-1.5 rotate-45 bg-amber-500/40 shrink-0" />
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Role dock ── */}
        <motion.section
          className="px-6 sm:px-10 py-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE.outExpo }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[10px] text-slate-500 tracking-[0.35em]">SELECT ACCESS PROFILE</span>
              <button
                onClick={() => setShowAdvanced(true)}
                className="group flex items-center gap-1.5 font-mono text-[10px] text-slate-500 hover:text-amber-400 tracking-[0.25em] transition-colors"
              >
                CUSTOM CREDENTIALS
                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 px-4 py-2.5 border border-red-500/30 bg-red-500/8 rounded-lg font-mono text-xs text-red-400">
                    ⚠ {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {ROLES.map((role, i) => (
                <motion.button
                  key={role.key}
                  onClick={() => handleRoleLogin(role.key, role.email)}
                  disabled={loading !== null}
                  className="group relative text-left p-4 rounded-xl border border-white/7 bg-white/[0.02] hover:bg-amber-500/[0.06] hover:border-amber-500/40 transition-colors duration-300 disabled:opacity-40 cursor-pointer overflow-hidden"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 + i * 0.06, ease: EASE.outExpo }}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/0 group-hover:via-amber-500/70 to-transparent transition-all duration-500" />

                  <div className="font-mono text-[10px] text-slate-600 group-hover:text-amber-500/80 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="font-display text-[13px] text-slate-200 group-hover:text-amber-300 mt-3 transition-colors leading-tight">
                    {role.role}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">{role.desc}</div>

                  {loading === role.key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#04080f]/85 backdrop-blur-sm">
                      <svg className="animate-spin w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            <p className="mt-6 text-center font-mono text-[9px] text-slate-700 tracking-[0.3em]">
              INTERNAL SYSTEM · ALL SESSIONS LOGGED · AVENIR INTERNATIONAL ENGINEERS
            </p>
          </div>
        </motion.section>
      </div>

      {/* ── Custom credentials panel ── */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[#04080f]/80 backdrop-blur-md" onClick={() => setShowAdvanced(false)} />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a1422]/95 p-8"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: EASE.outExpo }}
            >
              <button
                onClick={() => setShowAdvanced(false)}
                className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="font-mono text-[10px] text-amber-400/80 tracking-[0.35em] mb-1">RESTRICTED ACCESS</div>
              <h2 className="font-display text-xl text-slate-100 mb-6">Sign In</h2>
              <form onSubmit={handleAdvancedLogin} className="space-y-3">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" loading={loading === 'advanced'} className="w-full">
                  Authenticate
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#04080f' }}>
        <div className="font-hero text-2xl text-gradient-amber">HIREFLOW</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
