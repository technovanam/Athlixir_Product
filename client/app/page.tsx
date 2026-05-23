'use client';

import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import TargetAudience from './components/TargetAudience';
import ExploreCarousel from './components/ExploreCarousel';
import ResearchTrust from './components/ResearchTrust';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 font-sans">
      
      {/* Background ambient effects */}
      <div className="fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#FF4F21]/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />

      {/* Features Section — Powering Potential */}
      <Features />

      {/* Explore Carousel Section */}
      <ExploreCarousel />

      {/* Research & Trust Section */}
      <ResearchTrust />

      {/* Athlete Intelligence System Section */}
      <TargetAudience />

      {/* Final Call to Action Section */}
      <FinalCTA />

      {/* Footer */}
      <Footer />

    </div>
  );
}
