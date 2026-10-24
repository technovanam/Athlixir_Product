import React from 'react';
import { Loader2, LucideIcon } from 'lucide-react';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: LucideIcon;
}

/** Shared 44px-minimum touch target + focus-visible ring. Mobile-first —
 * no interaction here depends on hover; :active covers the touch case. */
const BASE =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full text-sm font-semibold transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent focus-visible:ring-offset-2 focus-visible:ring-offset-adx-bg';

export function PrimaryButton({ loading, icon: Icon, children, className = '', disabled, ...rest }: BaseButtonProps) {
  return (
    <button
      className={`${BASE} bg-adx-accent text-white hover:bg-adx-accent-hover ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function SecondaryButton({ loading, icon: Icon, children, className = '', disabled, ...rest }: BaseButtonProps) {
  return (
    <button
      className={`${BASE} bg-adx-surface-elevated text-adx-text-primary border border-adx-border-strong ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function TertiaryButton({ loading, icon: Icon, children, className = '', disabled, ...rest }: BaseButtonProps) {
  return (
    <button
      className={`${BASE} bg-transparent text-adx-accent px-3 ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function DangerButton({ loading, icon: Icon, children, className = '', disabled, ...rest }: BaseButtonProps) {
  return (
    <button
      className={`${BASE} bg-adx-danger/12 text-adx-danger ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // required — every icon-only button must be labeled for screen readers
  size?: number;
}

export function IconButton({ icon: Icon, label, size = 18, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`inline-flex items-center justify-center h-11 w-11 rounded-full bg-adx-surface-elevated text-adx-text-secondary border border-adx-border active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent ${className}`}
      {...rest}
    >
      <Icon size={size} />
    </button>
  );
}
