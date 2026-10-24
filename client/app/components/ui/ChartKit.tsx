import React from 'react';
import { TooltipProps } from 'recharts';
import AthlixirCard from './AthlixirCard';

interface ChartCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Wraps recharts content in the standard Athlixir card surface.
 * Content is provided by the caller — this is layout only, no charting
 * library beyond the already-installed recharts is introduced. */
export function ChartCard({ children, className = '' }: ChartCardProps) {
  return (
    <AthlixirCard padding="md" className={className}>
      {children}
    </AthlixirCard>
  );
}

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function ChartHeader({ title, subtitle, action }: ChartHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-bold text-adx-text-primary">{title}</h3>
        {subtitle && <p className="text-[12px] text-adx-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

interface ChartLegendItem {
  label: string;
  color: string;
}

export function ChartLegend({ items }: { items: ChartLegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="text-[11px] font-medium text-adx-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Drop-in recharts <Tooltip content={ChartTooltip} /> renderer, styled
 * to the dark surface tokens instead of recharts' default white box. */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-adx-border-strong bg-adx-surface-elevated px-3 py-2 shadow-lg">
      {label && <p className="text-[11px] font-semibold text-adx-text-muted mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-adx-text-secondary">{entry.name}:</span>
          <span className="font-bold text-adx-text-primary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
