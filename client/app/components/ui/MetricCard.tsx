import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
import AthlixirCard from './AthlixirCard';

interface MetricCardProps {
  label: string;
  /** Pass null/undefined for "not assessed yet" — never pass a fabricated
   * placeholder number. The component renders an honest "—" by construction;
   * there is no default-value prop that could silently fake a reading. */
  value: number | string | null | undefined;
  unit?: string;
  icon?: LucideIcon;
  /** Only render when a real historical comparison exists. */
  trend?: { direction: 'up' | 'down'; label: string } | null;
  /** Only render when a real baseline/benchmark value exists. */
  baseline?: string | null;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  baseline,
  className = '',
}: MetricCardProps) {
  const hasValue = value !== null && value !== undefined && value !== '';

  return (
    <AthlixirCard padding="md" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-adx-text-muted">
          {label}
        </span>
        {Icon && (
          <div className="h-7 w-7 rounded-lg bg-adx-accent-soft text-adx-accent flex items-center justify-center shrink-0">
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-bold tracking-tight ${hasValue ? 'text-2xl text-adx-text-primary' : 'text-xl text-adx-text-disabled'}`}>
          {hasValue ? value : '—'}
        </span>
        {hasValue && unit && (
          <span className="text-xs font-medium text-adx-text-muted">{unit}</span>
        )}
      </div>

      {hasValue && (trend || baseline) && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold">
          {trend && (
            <span className={`flex items-center gap-0.5 ${trend.direction === 'up' ? 'text-adx-success' : 'text-adx-danger'}`}>
              {trend.direction === 'up' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {trend.label}
            </span>
          )}
          {baseline && <span className="text-adx-text-muted">{baseline}</span>}
        </div>
      )}

      {!hasValue && (
        <span className="mt-1.5 text-[11px] font-medium text-adx-text-disabled">Not assessed</span>
      )}
    </AthlixirCard>
  );
}
