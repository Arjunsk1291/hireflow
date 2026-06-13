'use client';

import { motion } from 'framer-motion';
import { PIPELINE_STAGES } from '@/lib/constants';

// Stage tints across the funnel (cool → warm → success)
const TINTS = ['#8b8ff7', '#7c8cf8', '#6e9bf4', '#48b4e0', '#2dd4bf', '#34d399', '#5bd07f', '#34d399'];

export function PipelineFunnel({ stageCounts }: { stageCounts: number[] }) {
  const max = Math.max(1, ...stageCounts);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
      {PIPELINE_STAGES.map((stage, i) => {
        const count = stageCounts[i] ?? 0;
        const pct = (count / max) * 100;
        const tint = TINTS[i] ?? '#8b8ff7';
        return (
          <div key={stage} className="flex flex-col items-center gap-2.5">
            {/* Vertical bar well */}
            <div className="relative w-full h-36 rounded-xl skeu-inset overflow-hidden flex items-end">
              <motion.div
                className="w-full rounded-b-[10px] rounded-t-md"
                style={{
                  background: `linear-gradient(180deg, ${tint} 0%, ${tint}99 100%)`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 0 18px -2px ${tint}66`,
                }}
                initial={{ height: 0 }}
                whileInView={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="absolute top-2 left-0 right-0 text-center text-sm font-bold font-mono text-slate-100">
                {count}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 text-center leading-tight">{stage}</span>
          </div>
        );
      })}
    </div>
  );
}
