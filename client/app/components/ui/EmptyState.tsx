import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * SUCCESS_EMPTY state — a request that genuinely succeeded with zero
 * results. Never used for a failed request (that's DataFetchError).
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
      <div className="h-14 w-14 rounded-full bg-white/[0.06] text-adx-text-muted flex items-center justify-center mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-bold text-adx-text-primary">{title}</h3>
      {description && (
        <p className="text-sm text-adx-text-secondary mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {primaryAction && <PrimaryButton onClick={primaryAction.onClick}>{primaryAction.label}</PrimaryButton>}
          {secondaryAction && <SecondaryButton onClick={secondaryAction.onClick}>{secondaryAction.label}</SecondaryButton>}
        </div>
      )}
    </div>
  );
}
