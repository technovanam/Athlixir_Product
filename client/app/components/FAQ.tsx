'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircleQuestion, ArrowRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Camera & Setup',
    question: 'What camera or hardware do I need to record my sprint videos?',
    answer:
      'Any standard smartphone capable of recording 1080p at 60 FPS is fully compatible (e.g. iPhone, Samsung Galaxy, Pixel). For peak biomechanical fidelity, high frame rate modes (120 FPS or 240 FPS) can also be uploaded. No wearable markers, straps, or sensors are required.',
  },
  {
    category: 'Accuracy & Science',
    question: 'How accurate is Athlixir compared to ₹40L+ motion capture labs?',
    answer:
      'Athlixir leverages 33-point skeletal pose estimation validated against 3D optical motion capture standards. Our computer vision models calculate joint angles, cadence, and ground contact time within a ±2.3% margin of laboratory force plates, making it reliable for competitive track programs.',
  },
  {
    category: 'Injury Prevention',
    question: 'How does the Hamstring Strain & Dynamic Injury Guard work?',
    answer:
      'The AI engine monitors maximum hip flexion and knee extension angular velocities during terminal swing. By identifying excessive eccentric stretch and bilateral pelvic tilt imbalances early, Athlixir flags overuse fatigue risks before soft-tissue tears manifest.',
  },
  {
    category: 'Best Practices',
    question: 'What camera angle and distance produce the best kinematic results?',
    answer:
      'Position the smartphone on a tripod or steady surface approximately 5 to 8 meters perpendicular to the track (sagittal side view) at hip height. Ensure the sprinter passes through the middle 80% of the frame with uniform daylight or track lighting.',
  },
  {
    category: 'Coaching & Teams',
    question: 'Can track & field coaches manage multiple sprinters simultaneously?',
    answer:
      'Yes. The Coach & Academy plan enables roster management, multi-athlete performance dashboards, batch video processing, and cohort normative benchmarking across entire sprint squads.',
  },
  {
    category: 'Privacy & Data',
    question: 'Is athlete video and biometric data kept secure and private?',
    answer:
      'All uploaded videos and extracted kinematic coordinate landmarks are encrypted both in transit (TLS 1.3) and at rest (AES-256). Athlete data is never sold or utilized for third-party commercial advertising.',
  },
];

const FAQ: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1]);

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="relative w-full py-12 sm:py-14 bg-[#F2F2F7] text-[#1C1C1E] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#FF4F21]/[0.03] blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-2xs mb-4">
            <HelpCircle size={14} className="text-[#FF4F21]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1C1C1E] leading-[1.15]">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6B3D] to-[#FF8C66] bg-clip-text text-transparent">
              Questions.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#636366] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Athlixir&apos;s markerless computer vision sprint analysis.
          </p>
        </div>

        {/* 2-Column Responsive FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {FAQS.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={faq.question}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#FF4F21]/30 shadow-md shadow-black/[0.03]'
                    : 'bg-white border-black/[0.06] hover:border-black/[0.14]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 select-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4F21]">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#1C1C1E]">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#FF4F21] text-white rotate-180 shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <ChevronDown size={16} strokeWidth={2.5} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#636366] leading-relaxed border-t border-black/[0.04]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Support Footer Box */}
        <div className="mt-10 sm:mt-12 max-w-2xl mx-auto text-center p-7 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-xs">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] mb-3">
            <MessageCircleQuestion size={22} />
          </div>
          <h4 className="text-base sm:text-lg font-black text-[#1C1C1E]">
            Have a custom research or team question?
          </h4>
          <p className="text-xs sm:text-sm text-[#636366] mt-1 mb-5">
            Our biomechanics and computer vision engineers are here to assist track teams and sports science researchers.
          </p>
          <a
            href="mailto:support@technovanam.in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1C1E] text-white text-xs sm:text-sm font-bold hover:bg-[#FF4F21] transition-all active:scale-95 shadow-md shadow-black/10"
          >
            <span>Email Sports Science Support</span>
            <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
