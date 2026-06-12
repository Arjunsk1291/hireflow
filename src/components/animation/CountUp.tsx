'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useInView } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ value, duration = 1.8, className, prefix = '', suffix = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
        }
      },
    });
  }, [isInView, value, duration, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
