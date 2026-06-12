'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FloatingCard } from '@/components/animation/FloatingCard';
import { EASE } from '@/lib/constants';
import { DEMO_USERS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const AuthScene = dynamic(
  () => import('@/components/three/AuthScene').then((m) => ({ default: m.AuthScene })),
  { ssr: false },
);

const ROLES = [
  { key: 'master',       ...DEMO_USERS.master,        desc: 'Full system access' },
  { key: 'hr_admin',     ...DEMO_USERS.hr_admin,      desc: 'Manage hiring pipeline' },
  { key: 'svp',          ...DEMO_USERS.svp,           desc: 'Senior approvals' },
  { key: 'team_manager', ...DEMO_USERS.team_manager,  desc: 'Team oversight' },
  { key: 'team_lead',    ...DEMO_USERS.team_lead,     desc: 'Technical review' },
  { key: 'interviewer',  ...DEMO_USERS.interviewer,   desc: 'Panel feedback' },
  { key: 'finance',      ...DEMO_USERS.finance,       desc: 'Financial approvals' },
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden blueprint-grid">
      {/* 3D Background */}
      <div className="absolute inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <AuthScene />
        </Suspense>
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE.outExpo }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-400 font-medium tracking-widest">AVENIR INTERNATIONAL ENGINEERS</span>
          </div>
          <h1 className="font-display text-5xl text-slate-100 mb-3">HIREFLOW</h1>
          <p className="text-slate-500 text-sm">Select your role to enter the hiring platform</p>
        </motion.div>

        {/* Role Cards Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
          initial="initial"
          animate="animate"
        >
          {ROLES.map((role, i) => (
            <motion.div
              key={role.key}
              variants={{
                initial: { opacity: 0, y: 80, scale: 0.8, rotateX: 20 },
                animate: {
                  opacity: 1, y: 0, scale: 1, rotateX: 0,
                  transition: { duration: 0.8, ease: EASE.outBack },
                },
              }}
            >
              <FloatingCard delay={i * 0.3} intensity={3} className="h-full">
                <button
                  onClick={() => handleRoleLogin(role.key, role.email)}
                  disabled={loading !== null}
                  className="w-full glass-card p-4 text-left cursor-pointer group relative overflow-hidden h-full"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)' }} />

                  <div className="relative">
                    <div className="text-3xl mb-3">{role.icon}</div>
                    <div className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                      {role.role}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{role.desc}</div>
                    <div className="text-[10px] text-slate-600 mt-2 font-mono">{role.email}</div>

                    {loading === role.key && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#101e33]/80 rounded-lg">
                        <svg className="animate-spin w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </FloatingCard>
            </motion.div>
          ))}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-red-400 mb-4 glass-card p-3 border-red-500/20"
          >
            {error}
          </motion.div>
        )}

        {/* Advanced Login */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-slate-600 hover:text-amber-400 transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Advanced Login'} (custom credentials)
          </button>

          {showAdvanced && (
            <motion.form
              onSubmit={handleAdvancedLogin}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 max-w-xs mx-auto space-y-3"
            >
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={loading === 'advanced'} className="w-full">
                Sign In
              </Button>
            </motion.form>
          )}
        </motion.div>

        <motion.p
          className="text-center text-xs text-slate-700 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Internal system — Avenir International Engineers · All sessions logged
        </motion.p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050b14]">
        <div className="text-amber-400 font-display text-xl">HIREFLOW</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
