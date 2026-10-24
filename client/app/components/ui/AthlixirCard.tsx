import React from 'react';

interface AthlixirCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING: Record<NonNullable<AthlixirCardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * Base Athlixir Design System surface. Every other card variant
 * (MetricCard, InsightCard, SessionCard, ChartCard) composes this.
 * Not wired into any feature page yet — foundation for future phases.
 */
export default function AthlixirCard({
  children,
  className = '',
  elevated = false,
  padding = 'md',
}: AthlixirCardProps) {
  return (
    <div
      className={`rounded-[20px] border border-adx-border ${
        elevated ? 'bg-adx-surface-elevated' : 'bg-adx-surface'
      } ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
