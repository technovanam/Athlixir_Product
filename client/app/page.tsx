'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { ArrowRight, Shield, Check, Compass, Sparkles, ChevronDown, ChevronUp, Heart, TrendingUp, Target, Users, Zap } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  

  // Scroll snapping refs
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const researchRef = useRef<HTMLDivElement>(null);
  const forWhomRef = useRef<HTMLDivElement>(null);

  // Track active scroll snapped section to automatically update active navbar link
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === homeRef.current) {
              setActiveTab('home');
            } else if (entry.target === aboutRef.current) {
              setActiveTab('about');
            } else if (entry.target === featuresRef.current) {
              setActiveTab('features');
            } else if (entry.target === researchRef.current) {
              setActiveTab('research');
            } else if (entry.target === forWhomRef.current) {
              setActiveTab('for-whom');
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: '-80px 0px 0px 0px' }
    );

    if (homeRef.current) observer.observe(homeRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (researchRef.current) observer.observe(researchRef.current);
    if (forWhomRef.current) observer.observe(forWhomRef.current);

    return () => observer.disconnect();
  }, []);

  // Smooth scroll helper for navbar links
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'home' && homeRef.current) {
      homeRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'about' && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'features' && featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'research' && researchRef.current) {
      researchRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'for-whom' && forWhomRef.current) {
      forWhomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="crt-screen crt-flicker relative flex h-screen max-h-screen w-screen flex-col bg-zinc-950 text-white overflow-hidden selection:bg-[#FF4F21]/30 selection:text-white"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(16, 24, 12, 0.25) 0%, rgba(8, 12, 6, 0.75) 100%), url('/stadium_grass_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      {/* Warm Orange Ambient Stadium Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-b from-[#FF4F21]/15 to-transparent blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-950/10 blur-[150px] pointer-events-none"></div>

      {/* Header / Navbar - Fixed at the top of the screen */}
      <header className="fixed top-0 left-0 w-full z-50 bg-zinc-950/40 backdrop-blur-md px-8 md:px-16 h-20 border-b border-zinc-900/10">
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between relative">
          
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]">
            <div className="h-9 w-9 flex items-center justify-center">
              <svg className="h-8 w-8 text-[#FF4F21]" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,15 15,85 32,85 50,48 68,85 85,85" />
              </svg>
            </div>
            <span className="font-extrabold tracking-[0.12em] text-lg uppercase text-white">
              ATHL<span className="text-[#FF4F21]">IXIR</span>
            </span>
          </Link>

          {/* Navigation Links - Free Floating */}
          <nav className="hidden lg:flex h-full items-center gap-8">
            {[
              { id: 'home', label: 'Home', href: '/' },
              { id: 'about', label: 'About', href: '#' },
              { id: 'features', label: 'Features', href: '#' },
              { id: 'research', label: 'Research', href: '#' },
              { id: 'for-whom', label: 'For Whom', href: '#' },
              { id: 'contact', label: 'Contact', href: '#' },
            ].map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`h-full flex items-center text-sm font-semibold tracking-wide transition-all duration-300 relative px-1 ${
                  activeTab === link.id
                    ? 'text-[#FF4F21] font-bold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-transparent hover:bg-zinc-800/40 px-6 py-2.5 text-xs font-bold text-white transition-all duration-200"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#FF4F21]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-zinc-700/60 bg-transparent hover:bg-[#18230f]/35 px-6 py-2 text-sm font-bold text-white transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#FF4F21] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#FF4F21]/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Snap Scroll Vertical Container */}
      <main className="relative z-10 flex-1 w-full h-full overflow-y-auto scroll-smooth snap-y snap-mandatory">
        
        {/* SECTION 1: HOME SECTION */}
        <div 
          ref={homeRef}
          className="w-full h-screen snap-start shrink-0 px-8 md:px-16 relative flex items-center justify-center"
        >

            {/* Floating container: center hero content horizontally & vertically */}
            <div className="w-full flex items-center justify-center">

              {/* CENTER HERO SECTION */}
              <div className="w-full max-w-4xl text-center space-y-8 px-2 md:px-6">
                
                {/* Pill Badge */}
                <div className="inline-flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/5 px-5 py-2 text-[10px] font-black tracking-[0.2em] text-[#FF4F21] uppercase">
                    AI-Powered Athlete Ecosystem
                  </span>
                </div>

                {/* Headline Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl crt-glow-white font-extrabold tracking-tight leading-[1.1] text-white">
                  <span className="whitespace-nowrap">Your Talent. <span className="text-zinc-400/80">Your Data.</span></span>
                  <br />
                  <span className="text-[#FF4F21] crt-glow-orange drop-shadow-[0_4px_24px_rgba(255,79,33,0.25)] mt-1 block">
                    Your Future.
                  </span>
                </h1>

                {/* Description Subtitle */}
                <p className="text-zinc-300/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
                  Empowering grassroots athletes with verified digital profiles, injury tracking, performance analytics, and real career opportunities.
                </p>

                {/* Action CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#FF4F21] px-10 py-4 text-xs font-extrabold text-white shadow-xl shadow-[#FF4F21]/20 hover:brightness-110 hover:shadow-2xl hover:shadow-[#FF4F21]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                  >
                    <span>GET STARTED</span>
                  </Link>
                  
                  <Link
                    href="/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-[#3e502c]/50 bg-[#18230f]/30 hover:bg-[#18230f]/60 px-10 py-4 text-xs font-extrabold text-white transition-all duration-300"
                  >
                    <span>EXPLORE PLATFORM</span>
                  </Link>
                </div>

              </div>

              

            </div>


          </div>

          {/* SECTION 2: ABOUT SECTION */}
          <div 
            ref={aboutRef}
            className="w-full h-screen snap-start shrink-0 px-8 md:px-16 relative flex flex-col justify-between pt-24 pb-4"
          >
            

            {/* Centered Content Container */}
            <div className="w-full flex-1 flex items-center justify-center max-w-[96rem] mx-auto">
              
              {/* Floating Widgets Grid Container */}
              <div className="w-full grid lg:grid-cols-12 gap-8 items-center">
                
                {/* LEFT CONTENT COLUMN - Col span 7 */}
                <div className="lg:col-span-7 space-y-6 text-left rounded-3xl p-8 bg-transparent">
                  {/* Badge */}
                  <div className="inline-flex">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF4F21]/10 px-4 py-1.5 text-[9px] font-black tracking-[0.2em] text-[#FF4F21] uppercase">
                      ABOUT ATHLIXIR
                    </span>
                  </div>

                  {/* Headline Title */}
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white crt-glow-white">
                    Bringing Trust,<br />
                    Technology &amp;<br />
                    <span className="text-zinc-500">Opportunity.</span>
                  </h2>

                  {/* Description Subtitle */}
                  <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                    Athlixir is a digital ecosystem built for athletes from Tier-2 and Tier-3 cities. We help athletes build <strong className="text-white font-semibold">verified profiles</strong>, track performance, prevent injuries, and connect with mentors — all in one unified platform.
                  </p>

                  {/* Precision & Growth items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-xl">
                                        <div className="flex gap-4 items-start font-sans hover:shadow-lg transition-shadow duration-300">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#FF4F21]/10 flex items-center justify-center text-[#FF4F21]">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-wider uppercase text-white">PRECISION</h4>
                        <p className="text-[11px] text-zinc-500 leading-normal mt-1 font-semibold">Verified data that scouts and academies can actually trust.</p>
                      </div>
                    </div>
                                        <div className="flex gap-4 items-start font-sans hover:shadow-lg transition-shadow duration-300">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-900 flex items-center justify-center text-[#FF4F21]">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-wider uppercase text-white">GROWTH</h4>
                        <p className="text-[11px] text-zinc-500 leading-normal mt-1 font-semibold">AI-driven analytics to identify and fix performance gaps.</p>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4">
                    <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-[#FF4F21] px-10 py-3.5 text-xs font-extrabold tracking-wider text-white shadow-lg shadow-[#FF4F21]/20 hover:brightness-110 hover:shadow-[#FF4F21]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      LEARN MORE
                    </Link>
                  </div>
                </div>

                {/* RIGHT COLUMN (Overlapping graphics and community) - Col span 5 */}
                <div className="lg:col-span-5 flex items-center justify-center relative h-[450px] w-full">
                  
                  {/* Card 1: Train Smarter (Top Left) */}
                  <div className="absolute left-4 top-4 w-[220px] md:w-[240px] rounded-3xl bg-[#0b0c0a] border border-zinc-900/60 overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#FF4F21]/30 hover:scale-[1.02]">
                    <div className="h-[200px] w-full overflow-hidden bg-zinc-950">
                      <img 
                        src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80" 
                        alt="Train Smarter"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="p-4 bg-zinc-950/60">
                      <span className="text-[9px] font-black tracking-[0.2em] text-[#FF4F21] uppercase">
                        TRAINING
                      </span>
                      <h3 className="text-sm font-extrabold text-white mt-1">
                        Train Smarter.
                      </h3>
                    </div>
                  </div>

                  {/* Card 2: Real Impact (Bottom Right) */}
                  <div className="absolute right-4 bottom-4 w-[220px] md:w-[240px] rounded-3xl bg-[#0b0c0a] border border-zinc-900/60 overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#FF4F21]/30 hover:scale-[1.02] z-10">
                    <div className="h-[200px] w-full overflow-hidden bg-zinc-950">
                      <img 
                        src="https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80" 
                        alt="Real Impact"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                    <div className="p-4 bg-zinc-950/60">
                      <span className="text-[9px] font-black tracking-[0.2em] text-[#FF4F21] uppercase">
                        ECOSYSTEM
                      </span>
                      <h3 className="text-sm font-extrabold text-white mt-1">
                        Real Impact.
                      </h3>
                    </div>
                  </div>

                  {/* Floating Community Card (Middle overlap) */}
                  <div className="absolute left-[35%] top-[55%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#0c0d0b]/90 border border-[#3e502c]/20 backdrop-blur-md p-4 shadow-2xl z-20 w-[150px] transition-all duration-300 hover:border-[#FF4F21]/30">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Users className="h-3 w-3 text-[#FF4F21]" />
                      <span className="text-[8px] tracking-[0.2em] font-black text-zinc-400 uppercase">
                        COMMUNITY
                      </span>
                    </div>
                    <div className="flex -space-x-1.5 overflow-hidden mb-2.5">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
                      ].map((url, i) => (
                        <img
                          key={i}
                          className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-[#0c0d0b] object-cover"
                          src={url}
                          alt="member"
                        />
                      ))}
                    </div>
                    <div className="text-[9px] font-black text-zinc-400 tracking-wide">
                      Join 2k+ Athletes
                    </div>
                  </div>

                </div>

              </div>
              
            </div>

        </div>

        {/* SECTION 3: FEATURES SECTION */}
        <div 
          ref={featuresRef}
          className="w-full h-screen snap-start shrink-0 px-8 md:px-16 relative flex flex-col justify-between pt-24 pb-4"
        >
          
          {/* Centered Content Container */}
            <div className="w-full flex-1 flex items-center justify-center max-w-[96rem] mx-auto">
            
            {/* Grid Container */}
            <div className="w-full grid lg:grid-cols-12 gap-8 items-center">
              
              {/* LEFT COLUMN: Large Smart Analytics Engine Card - Col span 5 */}
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="w-full max-w-[420px] rounded-[2.5rem] bg-[#0c0d0a]/85 border border-[#FF4F21]/20 backdrop-blur-xl shadow-2xl p-8 relative overflow-hidden group transition-all duration-300 hover:border-[#FF4F21]/45">
                  
                  {/* Glowing background highlights */}
                  <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#FF4F21]/5 blur-3xl pointer-events-none"></div>

                  {/* Badge */}
                  <div className="mb-8">
                    <span className="inline-flex items-center rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/5 px-4 py-1.5 text-[9px] font-black tracking-[0.2em] text-[#FF4F21] uppercase">
                      POWERING POTENTIAL
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-[1.1] text-white">
                    Smart Performance<br />
                    <span className="text-[#FF4F21] crt-glow-orange drop-shadow-[0_2px_10px_rgba(255,79,33,0.15)]">Analytics Engine.</span>
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mt-6 font-semibold">
                    Track training sessions with surgical precision. Our AI identifies performance plateaus and provides actionable recovery protocols.
                  </p>

                  {/* List items */}
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4.5 w-4.5 text-[#FF4F21] shrink-0" />
                      <span className="text-xs font-bold text-zinc-300">Verified Injury History</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-4.5 w-4.5 text-[#FF4F21] shrink-0" />
                      <span className="text-xs font-bold text-zinc-300">AI Progress Trends</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4.5 w-4.5 text-[#FF4F21] shrink-0" />
                      <span className="text-xs font-bold text-zinc-300">Recruitment Portfolios</span>
                    </div>
                  </div>

                  {/* Bottom controls */}
                  <div className="flex justify-between items-end mt-12 pt-4 border-t border-zinc-900/40">
                    
                    {/* Button */}
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF4F21] px-6 py-3.5 text-[10px] font-black tracking-wider text-white shadow-lg shadow-[#FF4F21]/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                    >
                      <span>EXPLORE DASHBOARD</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {/* Subtle status lights */}
                    <div className="text-[8px] font-bold tracking-widest text-zinc-500 space-y-1.5 text-right uppercase">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>BIOMETRIC LINK</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00df89] shadow-[0_0_6px_#00df89] animate-pulse"></span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <span>NEURAL ENGINE</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F21] shadow-[0_0_6px_#FF4F21] animate-pulse"></span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Info and high-performance Dashboard Mockup - Col span 7 */}
              <div className="lg:col-span-7 space-y-6 text-left pl-0 lg:pl-6">
                
                {/* Badge */}
                <div className="inline-flex">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/5 px-4 py-1.5 text-[9px] font-black tracking-[0.2em] text-sky-400 uppercase">
                    THE FUTURE
                  </span>
                </div>

                {/* Headline Title */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl crt-glow-white font-black tracking-tight leading-[1.1] text-white">
                  Experience the Next<br />
                  <span className="text-zinc-500">Generation.</span>
                </h2>

                {/* Description Subtitle */}
                <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed font-semibold">
                  Wearable integration, sponsorship matching, and tier-based leaderboards — built specifically for India’s rising champions.
                </p>

                {/* Row of small tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['GPS TECH', 'BIO-METRIC', 'CLOUD SYNC', 'AI TRAINING'].map((tag) => (
                    <span 
                      key={tag} 
                      className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-1.5 text-[8px] font-black tracking-wider text-zinc-500 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Premium Responsive Dashboard Mockup Card */}
                <div className="w-full rounded-3xl bg-[#0a0a08]/90 border border-zinc-900/60 p-6 shadow-2xl relative overflow-hidden mt-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 tracking-wider uppercase">
                      <span>USERS: LAST 7 DAYS USING MEDIAN</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                    <div className="flex gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                      <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                      <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                    </div>
                  </div>

                  {/* Chart columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Left graph panel: LOAD TIME VS BOUNCE RATE */}
                    <div className="rounded-2xl border border-zinc-900/50 bg-[#0f0f0c]/60 p-4 relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[8px] font-black text-zinc-500 tracking-wider uppercase">LOAD TIME VS BOUNCE RATE</span>
                        <span className="text-[8px] font-black text-zinc-400 tracking-widest">OPTIONS</span>
                      </div>

                      {/* Chart visual mock */}
                      <div className="h-28 w-full flex items-end gap-1.5 pt-4 relative">
                        
                        {/* Tooltip block floating on the peak bar */}
                        <div className="absolute top-0 left-[35%] rounded bg-zinc-900 border border-zinc-800 p-2 shadow-xl z-20 flex flex-col items-center">
                          <span className="text-[7px] font-bold text-zinc-500 uppercase leading-none">Bounce Rate %</span>
                          <span className="text-[10px] font-black text-white mt-0.5 leading-none">57.1%</span>
                        </div>

                        {/* Bars */}
                        {[25, 45, 60, 85, 95, 65, 40, 20, 15, 8].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end h-full">
                            <div 
                              className="w-full rounded-t-sm bg-sky-500/80 transition-all duration-300 hover:bg-sky-400"
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right graph panel: START RENDER VS BOUNCE RATE */}
                    <div className="rounded-2xl border border-zinc-900/50 bg-[#0f0f0c]/60 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[8px] font-black text-zinc-500 tracking-wider uppercase">START RENDER VS BOUNCE RATE</span>
                        <span className="text-[8px] font-black text-zinc-400 tracking-widest">OPTIONS</span>
                      </div>

                      {/* Chart visual mock */}
                      <div className="h-28 w-full flex items-end gap-1.5 pt-4 relative">
                        
                        {/* Floating line graph mock using an overlay SVG */}
                        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path 
                            d="M 5,90 Q 30,10 60,70 T 95,30" 
                            fill="none" 
                            stroke="#00df89" 
                            strokeWidth="2" 
                            className="opacity-70"
                          />
                          <path 
                            d="M 5,95 Q 40,40 70,80 T 95,15" 
                            fill="none" 
                            stroke="#FF4F21" 
                            strokeWidth="1.5" 
                            className="opacity-45"
                          />
                        </svg>

                        {/* Bars */}
                        {[15, 30, 75, 90, 80, 50, 30, 25, 45, 60].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end h-full z-10 opacity-30">
                            <div 
                              className="w-full rounded-t-sm bg-teal-500"
                              style={{ height: `${height}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Stats footer panel */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-zinc-900/40">
                    
                    {/* Active metric details */}
                    <div className="col-span-2 rounded-xl border border-zinc-900/40 bg-zinc-950/40 p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-[#FF4F21] tracking-widest uppercase">ACTIVE METRIC</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00df89]"></span>
                      </div>
                      <div className="text-base font-black text-white mt-1">98.4 bpm</div>
                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-2">
                        <div className="w-[70%] h-full bg-[#FF4F21] rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Sessions count */}
                    <div className="rounded-xl border border-zinc-900/40 bg-zinc-950/40 p-3">
                      <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block">SESSIONS</span>
                      <div className="text-base font-black text-white mt-1">479K</div>
                      <span className="text-[7px] text-[#00df89] font-bold mt-1 block">▲ 12.4%</span>
                    </div>

                    {/* Session length */}
                    <div className="rounded-xl border border-zinc-900/40 bg-zinc-950/40 p-3">
                      <span className="text-[7px] font-black text-zinc-500 tracking-widest uppercase block">SESSION LENGTH</span>
                      <div className="text-base font-black text-white mt-1">17 min</div>
                      <span className="text-[7px] text-zinc-500 font-bold mt-1 block">stable</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
            
          </div>

        </div>

        {/* SECTION 4: RESEARCH SECTION (ATHLIXIR ADVANTAGE SLIDER) */}
        <div 
          ref={researchRef}
          className="w-full h-screen snap-start shrink-0 px-8 md:px-16 relative flex flex-col justify-between pt-24 pb-4"
        >
          
          {/* Centered Content Container for Header */}
          <div className="w-full max-w-[96rem] mx-auto px-8 md:px-16 mb-4">
            {/* Header Text */}
            <div className="text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl crt-glow-white font-black tracking-tight leading-[1.1] text-white">
                Experience the<br />
                <span className="text-zinc-500">Athlixir Advantage.</span>
              </h2>
            </div>
          </div>

          {/* Horizontal Slider Layout - Full Width (End-to-End) */}
          <div className="w-full flex-1 flex items-center relative overflow-hidden">
            <div className="w-full relative">
              
              {/* Fade masks for visual depth in slider edges */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-20 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 via-zinc-950/60 to-transparent z-20 pointer-events-none"></div>

              {/* Cards Container */}
              <div className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory px-4 md:px-12 lg:px-24">
                
                {[
                  {
                    index: '01',
                    title: 'Verified Digital\nProfiles',
                    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    index: '02',
                    title: 'Performance\nAnalysis',
                    image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    index: '03',
                    title: 'Forgery\nDetection',
                    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    index: '04',
                    title: 'Tier\nLeaderboards',
                    image: 'https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    index: '05',
                    title: 'Academy\nLocator',
                    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
                  },
                ].map((card, i) => (
                  <div 
                    key={i}
                    className="min-w-[250px] md:min-w-[275px] h-[360px] md:h-[385px] rounded-[2.2rem] border border-zinc-900 bg-[#0a0a08] relative overflow-hidden group transition-all duration-300 hover:border-[#FF4F21]/30 hover:scale-[1.02] snap-center shadow-2xl shrink-0"
                  >
                    
                    {/* Background image */}
                    <img 
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>

                    {/* Text content details bottom aligned */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between items-start z-10">
                      
                      {/* Red/Orange Index */}
                      <span className="text-[9px] font-black text-[#FF4F21] tracking-wider uppercase mb-1">
                        {card.index}
                      </span>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                        {card.title.split('\n').map((line, k) => (
                          <React.Fragment key={k}>
                            {line}
                            {k < card.title.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </h3>

                    </div>

                    {/* Floating circular arrow action button */}
                    <div className="absolute bottom-6 right-6 z-20">
                      <div className="h-10 w-10 rounded-full bg-zinc-950/80 border border-zinc-900/60 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#FF4F21] group-hover:border-[#FF4F21] group-hover:text-white transition-all duration-300 cursor-pointer shadow-md">
                        <ArrowRight className="h-4.5 w-4.5" />
                      </div>
                    </div>

                  </div>
                ))}

              </div>

            </div>
          </div>
          <div className="h-2"></div>

        </div>

        {/* SECTION 5: FOR WHOM SECTION */}
        <div 
          ref={forWhomRef}
          className="w-full h-screen snap-start shrink-0 px-8 md:px-16 relative flex flex-col justify-between pt-24 pb-4"
        >
          
          {/* Centered Content Container */}
          <div className="w-full flex-1 flex flex-col justify-center max-w-[96rem] mx-auto space-y-8">
            
            {/* Header Title Grid */}
            <div className="text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/5 text-[#FF4F21] text-[10px] font-black tracking-widest uppercase">
                TARGET AUDIENCE
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl crt-glow-white font-black tracking-tight leading-[1.1] text-white">
                Who Athlixir Serves.<br />
                <span className="text-zinc-500 text-base md:text-lg font-semibold tracking-wide">Tailored for every stakeholder in the sports ecosystem.</span>
              </h2>
            </div>

            {/* Stakeholder 3-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              
              {[
                {
                  role: 'ATHLETES',
                  title: 'Grassroots & Elite Athletes',
                  desc: 'Publish verified digital profiles, secure medical history logs, and unlock scouting channels to showcase your true raw potential.',
                  icon: Users,
                  image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
                  features: ['Verified Identity', 'Telemetry Tracking', 'Scout Access']
                },
                {
                  role: 'COACHES & RECRUITERS',
                  title: 'Trainers, Coaches & Scouts',
                  desc: 'Access precision biomechanical logs, verified medical status history, and deep analytical reports to spot authentic future talent.',
                  icon: Target,
                  image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80',
                  features: ['Precise Data Logs', 'HIPAA Secure', 'Recruitment Hub']
                },
                {
                  role: 'ORGANIZATIONS',
                  title: 'Clubs, Academies & Leagues',
                  desc: 'Integrate scalable talent pipelines, govern unified medical data, and verify rosters securely using centralized data consoles.',
                  icon: Shield,
                  image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
                  features: ['Team Portals', 'Data Verification', 'Growth Control']
                }
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div 
                    key={i}
                    className="h-[380px] md:h-[410px] w-full rounded-[2.5rem] border border-zinc-900 bg-[#070806]/40 relative overflow-hidden group transition-all duration-500 hover:border-[#FF4F21]/30 hover:scale-[1.01] shadow-2xl flex flex-col justify-between p-8"
                  >
                    
                    {/* Background image overlay */}
                    <img 
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-[0.12] group-hover:opacity-[0.2] group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Glass backdrop glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>

                    {/* Top Segment details */}
                    <div className="relative z-10 space-y-4">
                      
                      {/* Icon Circle */}
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md flex items-center justify-center text-[#FF4F21] group-hover:bg-[#FF4F21]/15 group-hover:text-white transition-all duration-300">
                        <Icon className="h-5.5 w-5.5" />
                      </div>

                      {/* Header tags */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#FF4F21] tracking-widest uppercase block">
                          {card.role}
                        </span>
                        <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                          {card.title}
                        </h3>
                      </div>

                      {/* Pitch paragraph */}
                      <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                        {card.desc}
                      </p>

                    </div>

                    {/* Features list at bottom segment */}
                    <div className="relative z-10 pt-4 border-t border-zinc-900/60 flex flex-wrap gap-2">
                      {card.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800/40 text-[9px] font-bold text-zinc-400 group-hover:text-white group-hover:border-zinc-800 transition-colors duration-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* HIGH-FIDELITY snapped MULTI-COLUMN FOOTER */}
        <footer className="snap-start w-full bg-zinc-950 border-t border-zinc-900/40 px-8 md:px-16 py-16 flex flex-col justify-between backdrop-blur-md relative z-10">
          
          {/* Main Footer Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 max-w-[96rem] mx-auto w-full pb-12 border-b border-zinc-900/40">
            
            {/* Left Column (Brand info and socials) - Col span 4 */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center">
                  <svg className="h-8 w-8 text-[#FF4F21]" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,15 15,85 32,85 50,48 68,85 85,85" />
                  </svg>
                </div>
                <span className="font-extrabold tracking-[0.12em] text-lg uppercase text-white">
                  ATHL<span className="text-[#FF4F21]">IXIR</span>
                </span>
              </Link>

              {/* Tagline description */}
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-xs font-semibold">
                Empowering grassroots athletes with verified digital profiles, performance analytics, and real career opportunities.
              </p>

              {/* Social Icons row */}
              <div className="flex gap-3 pt-2">
                {[
                  { 
                    label: 'Instagram', 
                    svg: (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    ) 
                  },
                  { 
                    label: 'Twitter', 
                    svg: (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    ) 
                  },
                  { 
                    label: 'LinkedIn', 
                    svg: (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    ) 
                  },
                  { 
                    label: 'Facebook', 
                    svg: (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    ) 
                  },
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href="#"
                    aria-label={social.label}
                    className="h-9 w-9 rounded-full border border-zinc-900/60 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:bg-[#FF4F21] hover:border-[#FF4F21] hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    {social.svg}
                  </a>
                ))}
              </div>

            </div>

            {/* Column 2 (Platform Directory) - Col span 2 */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                PLATFORM
              </h4>
              <ul className="space-y-2.5 font-semibold text-xs text-zinc-300">
                {['About Us', 'Vision', 'Research', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#FF4F21] transition-colors duration-200 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 (Ecosystem Directory) - Col span 2 */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                ECOSYSTEM
              </h4>
              <ul className="space-y-2.5 font-semibold text-xs text-zinc-300">
                {['For Athletes', 'For Coaches', 'For Academies'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#FF4F21] transition-colors duration-200 block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 (Subscribe / Stay updated) - Col span 4 */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <h4 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                STAY UPDATED
              </h4>
              <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
                Join our newsletter for the latest updates.
              </p>
              
              {/* Input details */}
              <div className="space-y-3 w-full">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-[#0d0e0c]/90 border border-zinc-900 rounded-2xl px-5 py-4 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4F21]/40 transition-colors duration-200"
                />
                <button className="w-full bg-white text-black font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                  SUBSCRIBE
                </button>
              </div>

            </div>

          </div>

          {/* Bottom Copyright & Terms Directory */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-[11px] font-bold text-zinc-500 uppercase tracking-wider max-w-[96rem] mx-auto w-full gap-4">
            <div>
              © 2026 Athlixir | Built with purpose.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            </div>
          </div>

        </footer>

      </main>
    </div>
  );
}

