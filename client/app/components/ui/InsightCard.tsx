import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import AthlixirCard from './AthlixirCard';
import SourceBadge, { DataSource } from './SourceBadge';

interface InsightCardProps {
  title: string;
  body: string;
  icon?: LucideIcon;
  source?: DataSource;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/** A single AI-generated or backend-derived insight. Content must come
 * from the backend — this component only lays it out, it never invents text. */
export default function InsightCard({
  title,
  body,
  icon: Icon = Sparkles,
  source,
  action,
  className = '',
}: InsightCardProps) {
  return (
    <AthlixirCard padding="md" className={className}>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-adx-accent-soft text-adx-accent flex items-center justify-center shrink-0">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-adx-text-primary">{title}</h4>
            {source && <SourceBadge source={source} />}
          </div>
          <p className="text-[13px] leading-relaxed text-adx-text-secondary mt-1">{body}</p>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-2.5 text-[13px] font-semibold text-adx-accent active:opacity-70 transition"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </AthlixirCard>
  );
}
