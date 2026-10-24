import React from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-adx-success/12 text-adx-success',
  warning: 'bg-adx-warning/12 text-adx-warning',
  danger: 'bg-adx-danger/12 text-adx-danger',
  info: 'bg-adx-info/12 text-adx-info',
  neutral: 'bg-white/[0.06] text-adx-text-secondary',
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

/** Status is always communicated with a text label, never color alone
 * (Step 20 — accessibility, color-independent status). */
export default function StatusBadge({ label, tone, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${TONE_CLASSES[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
