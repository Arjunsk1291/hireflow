'use client';

import dynamic from 'next/dynamic';

const PipelineScene = dynamic(
  () => import('@/components/three/PipelineScene').then((m) => ({ default: m.PipelineScene })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] flex items-center justify-center text-slate-600 text-sm">
        Loading pipeline...
      </div>
    ),
  },
);

interface Props {
  stageCounts: number[];
}

export function PipelineSceneWrapper({ stageCounts }: Props) {
  return <PipelineScene stageCounts={stageCounts} />;
}
