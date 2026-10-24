import React from 'react';

interface LoadingSkeletonProps {
  /** Number of skeleton rows/blocks to render. */
  count?: number;
  variant?: 'card' | 'line' | 'circle';
  className?: string;
}

/**
 * Pure shimmer placeholder — represents "we don't know the shape of the
 * data yet", never a fake percentage or a fake partially-filled value.
 * Respects prefers-reduced-motion (shimmer disabled via the reduced-motion
 * media query in globals.css utility below is not required since this only
 * uses opacity pulse, which Tailwind's `animate-pulse` already keeps subtle;
 * for stricter compliance consumers can pass `motion-reduce:animate-none`
 * via className).
 */
export default function LoadingSkeleton({ count = 1, variant = 'card', className = '' }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'line') {
    return (
      <div className="space-y-2" role="status" aria-label="Loading">
        {items.map((_, i) => (
          <div key={i} className={`h-3 rounded-full bg-white/[0.06] animate-pulse motion-reduce:animate-none ${className}`} />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div className="flex gap-3" role="status" aria-label="Loading">
        {items.map((_, i) => (
          <div key={i} className={`h-10 w-10 rounded-full bg-white/[0.06] animate-pulse motion-reduce:animate-none ${className}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {items.map((_, i) => (
        <div
          key={i}
          className={`h-24 rounded-[20px] border border-adx-border bg-white/[0.04] animate-pulse motion-reduce:animate-none ${className}`}
        />
      ))}
    </div>
  );
}
