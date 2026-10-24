import React from 'react';
import { SearchX } from 'lucide-react';
import { SecondaryButton } from './Buttons';

interface NotFoundStateProps {
  title?: string;
  description?: string;
  backLabel?: string;
  onBack?: () => void;
  className?: string;
}

/**
 * Distinct from EmptyState (a successful-but-empty list) and DataFetchError
 * (a request that failed) — this is "the specific resource you asked for
 * does not exist / is not yours", i.e. a real 404 response.
 */
export default function NotFoundState({
  title = 'Not found',
  description = "We couldn't find what you're looking for.",
  backLabel = 'Go back',
  onBack,
  className = '',
}: NotFoundStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}>
      <div className="h-14 w-14 rounded-full bg-white/[0.06] text-adx-text-muted flex items-center justify-center mb-4">
        <SearchX size={24} />
      </div>
      <h3 className="text-base font-bold text-adx-text-primary">{title}</h3>
      <p className="text-sm text-adx-text-secondary mt-1.5 max-w-xs leading-relaxed">{description}</p>
      {onBack && (
        <div className="mt-5">
          <SecondaryButton onClick={onBack}>{backLabel}</SecondaryButton>
        </div>
      )}
    </div>
  );
}
