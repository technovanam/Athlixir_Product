'use client';

import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import PoseOverlay from './components/PoseOverlay';
import SampleReport from './components/SampleReport';
import BetaProgram from './components/BetaProgram';
import About from './components/About';
import Features from './components/Features';
import LegAnatomy from './components/LegAnatomy';
import HardwareShowcase from './components/HardwareShowcase';
import ComparisonMatrix from './components/ComparisonMatrix';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] selection:bg-[#FF4F21]/20 selection:text-[#FF4F21] font-poppins">

      {/* Background ambient subtle light effects */}
      <div className="fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#FF4F21]/[0.06] blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#FF4F21]/[0.04] blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* How it works — record, upload, report */}
      <HowItWorks />

      {/* Raw video vs pose-tracking overlay */}
      <PoseOverlay />

      {/* About Section */}
      <About />

      {/* Features Section — Powering Potential */}
      <Features />

      {/* Interactive sample report */}
      <SampleReport />

      {/* 3D Lower-Limb Anatomy — BodyParts3D */}
      <LegAnatomy />

      {/* Hardware — sleeve, insole and telemetry pod */}
      <HardwareShowcase />

      {/* Comparison Matrix — Markerless Vision vs Lab MoCap */}
      <ComparisonMatrix />

      {/* Beta athletes — in place of testimonials until real results exist */}
      <BetaProgram />

      {/* Transparent Pricing Section */}
      <Pricing />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Final Call to Action Section */}
      <FinalCTA />

      {/* Footer */}
      <Footer />

    </div>
  );
}
