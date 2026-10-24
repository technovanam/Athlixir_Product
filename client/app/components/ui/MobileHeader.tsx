'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  variant: 'home' | 'page';
  title?: string;
  greeting?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onBack?: () => void;
}

export default function MobileHeader({ variant, title, greeting, leading, trailing, onBack }: MobileHeaderProps) {
  const router = useRouter();

  if (variant === 'home') {
    return (
      <div className="flex items-center justify-between h-14 px-4 bg-white/85 backdrop-blur-2xl border-b border-adx-border font-poppins">
        <div className="flex items-center gap-3 min-w-0">
          {leading}
          {greeting && <span className="text-sm font-bold text-adx-text-primary truncate">{greeting}</span>}
        </div>
        <div className="flex items-center gap-2 shrink-0">{trailing}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center h-14 px-4 gap-3 bg-white/85 backdrop-blur-2xl border-b border-adx-border font-poppins">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        aria-label="Go back"
        className="h-9 w-9 rounded-full bg-black/[0.04] text-adx-text-secondary flex items-center justify-center active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent shrink-0"
      >
        <ArrowLeft size={17} />
      </button>
      <h1 className="text-base font-bold text-adx-text-primary truncate flex-1">{title}</h1>
      <div className="flex items-center gap-2 shrink-0">{trailing}</div>
    </div>
  );
}
