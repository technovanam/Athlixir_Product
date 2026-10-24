import React from 'react';
import StatusBadge, { StatusTone } from './StatusBadge';

export type DataQuality = 'HIGH' | 'MODERATE' | 'LOW' | 'UNASSESSED';

const QUALITY_META: Record<DataQuality, { label: string; tone: StatusTone }> = {
  HIGH: { label: 'High Quality', tone: 'success' },
  MODERATE: { label: 'Moderate Quality', tone: 'warning' },
  LOW: { label: 'Low Quality', tone: 'danger' },
  UNASSESSED: { label: 'Not Assessed', tone: 'neutral' },
};

interface DataQualityBadgeProps {
  quality: DataQuality;
  className?: string;
}

/** Reflects a real backend-computed data-quality/confidence signal.
 * Defaults to UNASSESSED rather than guessing HIGH. */
export default function DataQualityBadge({ quality, className = '' }: DataQualityBadgeProps) {
  const meta = QUALITY_META[quality] ?? QUALITY_META.UNASSESSED;
  return <StatusBadge label={meta.label} tone={meta.tone} className={className} />;
}
