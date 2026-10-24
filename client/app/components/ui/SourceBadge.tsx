import React from 'react';
import { Cpu, Video, Radio, Database, HelpCircle } from 'lucide-react';

export type DataSource =
  | 'SYNTHETIC'
  | 'VIDEO_ANALYSIS'
  | 'ATHLIXIR_HARDWARE'
  | 'PUBLIC_DATA'
  | 'UNKNOWN';

const SOURCE_META: Record<DataSource, { label: string; icon: typeof Cpu }> = {
  SYNTHETIC: { label: 'Synthetic', icon: Radio },
  VIDEO_ANALYSIS: { label: 'Video Analysis', icon: Video },
  ATHLIXIR_HARDWARE: { label: 'Athlixir Hardware', icon: Cpu },
  PUBLIC_DATA: { label: 'Public Data', icon: Database },
  UNKNOWN: { label: 'Unknown Source', icon: HelpCircle },
};

interface SourceBadgeProps {
  source: DataSource;
  className?: string;
}

/**
 * Provenance label. `source` is a required prop with NO default — a caller
 * can never accidentally render "Athlixir Hardware" without explicitly
 * passing it, and there is currently no code path anywhere in the app that
 * has real hardware data to pass. UNKNOWN fails safely rather than guessing.
 */
export default function SourceBadge({ source, className = '' }: SourceBadgeProps) {
  const meta = SOURCE_META[source] ?? SOURCE_META.UNKNOWN;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-adx-text-muted ${className}`}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  );
}
