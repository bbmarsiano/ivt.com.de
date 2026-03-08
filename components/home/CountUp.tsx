'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({ target, prefix = '', suffix = '', duration = 1500, className = '' }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasStartedRef = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || hasStartedRef.current) return;
        hasStartedRef.current = true;

        const start = 0;
        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = Math.round(start + (target - start) * easeOutQuart);
          setDisplayValue(current);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={containerRef} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
