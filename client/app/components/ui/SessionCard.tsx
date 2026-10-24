import React from 'react';
import { ChevronRight, PlayCircle } from 'lucide-react';
import AthlixirCard from './AthlixirCard';
import StatusBadge, { StatusTone } from './StatusBadge';

interface SessionCardProps {
  title: string;
  date: string;
  status?: { label: string; tone: StatusTone };
  performanceScore?: number | null;
  onClick?: () => void;
  className?: string;
}

/** Row-style card for a single past analysis/session — used by list-style
 * pages (Reports, History) in future phases. Score renders honestly. */
export default function SessionCard({
  title,
  date,
  status,
  performanceScore,
  onClick,
  className = '',
}: SessionCardProps) {
  const hasScore = performanceScore !== null && performanceScore !== undefined;

  return (
    <AthlixirCard padding="none" className={`overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className="w-full flex items-center gap-3 p-4 text-left active:bg-adx-surface-elevated transition disabled:active:bg-transparent"
      >
        <div className="h-10 w-10 rounded-full bg-adx-accent-soft text-adx-accent flex items-center justify-center shrink-0">
          <PlayCircle size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-adx-text-primary truncate">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-adx-text-muted">{date}</span>
            {status && <StatusBadge label={status.label} tone={status.tone} />}
          </div>
        </div>

        {hasScore ? (
          <span className="text-lg font-bold text-adx-text-primary shrink-0">{performanceScore}</span>
        ) : (
          <span className="text-xs font-medium text-adx-text-disabled shrink-0">—</span>
        )}

        {onClick && <ChevronRight size={16} className="text-adx-text-muted shrink-0" />}
      </button>
    </AthlixirCard>
  );
}
