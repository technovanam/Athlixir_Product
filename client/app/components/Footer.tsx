'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Send, CheckCircle2, Check, ArrowUpRight } from 'lucide-react';

const TwitterXIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'X / Twitter', href: 'https://twitter.com', icon: TwitterXIcon },
  { name: 'Instagram', href: 'https://instagram.com', icon: InstagramIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedInIcon },
  { name: 'GitHub', href: 'https://github.com', icon: GitHubIcon },
];

const FOOTER_NAV = [
  {
    title: 'Platform',
    links: [
      { label: 'Kinematic Studio', href: '/dashboard?tab=biomechanics' },
      { label: 'Athlete Dashboard', href: '/dashboard' },
      { label: 'Sprint Reports', href: '/reports' },
      { label: 'Norm Benchmarks', href: '/recommendations' },
    ],
  },
  {
    title: 'Athlete Hub',
    links: [
      { label: 'Physical Profile', href: '/identity' },
      { label: 'Sprint History', href: '/history' },
      { label: 'Injury Risk Guard', href: '/injury-risk' },
      { label: 'AI Sprint Coach', href: '/copilot' },
    ],
  },
  {
    title: 'Company & Plans',
    links: [
      { label: 'About Science', href: '/#about' },
      { label: 'Capabilities', href: '/#features' },
      { label: 'MoCap Comparison', href: '/#comparison' },
      { label: 'Pricing Plans', href: '/#pricing' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Support & Contact', href: '/#contact' },
    ],
  },
];

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 3) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer id="contact" className="relative z-20 w-full overflow-hidden border-t border-black/[0.06] bg-white text-[#1C1C1E] font-poppins">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-16 pb-10">
        
        {/* Top Grid: Brand/Newsletter + 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-black/[0.06]">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-5 max-w-md space-y-5">
            <Logo />
            
            <p className="text-sm leading-relaxed text-[#636366] font-normal">
              Athlixir empowers sprinters, coaches, and sports scientists with lab-grade computer vision kinematic analysis directly from smartphone video.
            </p>

            {/* Parent Company Attribution Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F7FA] border border-black/[0.06] text-xs text-[#636366]">
              <span>A product of</span>
              <a
                href="https://www.technovanam.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1C1C1E] hover:text-[#FF4F21] underline underline-offset-2 transition-colors"
              >
                Techno Vanam Innovation Pvt. Ltd.
              </a>
            </div>

            {/* Newsletter Dispatch Box */}
            <form onSubmit={handleSubscribe} className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] block mb-2">
                Stay updated with sprint research
              </span>
              <div className="flex items-center rounded-2xl border border-black/[0.08] bg-[#F7F7FA] p-1.5 focus-within:border-[#FF4F21] focus-within:bg-white focus-within:shadow-xs transition">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@team.com"
                  required
                  className="min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-medium text-[#1C1C1E] placeholder:text-[#8E8E93] outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="inline-flex h-9 px-4 shrink-0 items-center justify-center rounded-xl bg-[#FF4F21] text-white text-xs font-bold transition hover:bg-[#E03E12] active:scale-95 gap-1.5 shadow-2xs"
                >
                  {subscribed ? (
                    <>
                      <Check size={13} className="stroke-[3]" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <span>Join</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#34C759]">
                  <CheckCircle2 size={13} /> You are subscribed to the Athlixir Research Dispatch.
                </p>
              )}
            </form>
          </div>

          {/* 3 Nav Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_NAV.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1E] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm font-medium text-[#636366] hover:text-[#FF4F21] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar: Copyright, System Status & Social Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#8E8E93]">
          
          {/* Left: Copyright */}
          <div className="text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} ATHLIXIR. Product of </span>
            <a
              href="https://www.technovanam.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1C1C1E] font-semibold hover:text-[#FF4F21] underline underline-offset-2 transition-colors"
            >
              Techno Vanam Innovation Pvt. Ltd.
            </a>
          </div>

          {/* Center: System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2F2F7] border border-black/[0.04] text-[11px] font-semibold text-zinc-700">
            <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>AI Kinematic Engine: Operational</span>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="h-8 w-8 rounded-full border border-black/[0.06] bg-[#F7F7FA] text-[#636366] hover:text-white hover:bg-[#FF4F21] hover:border-[#FF4F21] flex items-center justify-center transition-all active:scale-95 shadow-2xs"
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
