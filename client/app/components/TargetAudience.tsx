'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';

interface AudienceItem {
  icon: React.ReactNode;
  title: string;
  label: string;
  description: string;
  bgImg: string;
}

const TargetAudience = () => {
  const audiences: AudienceItem[] = [
    {
      icon: <Activity size={24} className="text-[#FF4F21]" />,
      title: "Biomechanics Analysis",
      label: "Movement Intelligence",
      description: "Analyze cadence, stride length, GCT, posture mechanics, and sprint symmetry using AI-powered biomechanical tracking.",
      bgImg: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop",
    },
    {
      icon: <BarChart3 size={24} className="text-[#FF4F21]" />,
      title: "Performance Benchmarking",
      label: "Scientific Scoring",
      description: "Compare athlete performance against district, state, and elite sprint-performance benchmarks.",
      bgImg: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600&auto=format&fit=crop",
    },
    {
      icon: <TrendingUp size={24} className="text-[#FF4F21]" />,
      title: "Athlete Evolution Tracking",
      label: "Progress Intelligence",
      description: "Track long-term sprint improvement, performance growth, injury-risk reduction, and biomechanical adaptation.",
      bgImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    }
  ];

  return (
    <section id="athletes" className="pt-8 pb-16 md:pt-12 md:pb-24 bg-transparent relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#FF4F21]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex px-5 py-2 rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/10 text-[11px] font-bold uppercase tracking-[0.25em] mb-4 text-[#FF4F21] backdrop-blur-sm">
            Athlete Intelligence System
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mt-4 tracking-tight leading-tight">
            Inside Athlete <br />
            <span className="text-zinc-500">Performance Intelligence.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8 max-w-5xl mx-auto">
          {audiences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative group h-[400px] md:h-[440px] rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer border border-white/10 flex flex-col justify-end"
              style={{ transform: "translate3d(0,0,0)" }}
            >
              {/* Full-visible background photo */}
              <img
                src={item.bgImg}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
              />

              {/* Subtle bottom gradient only for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />

              {/* Top Label */}
              <div className="absolute top-6 left-6 z-20">
                <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[9px] font-bold uppercase tracking-widest text-white">
                  {item.label}
                </span>
              </div>

              {/* Card content at the bottom */}
              <div className="relative z-20 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-black/30 backdrop-blur-xl p-3.5 rounded-2xl mb-4 w-14 h-14 flex items-center justify-center border border-white/20 group-hover:border-[#FF4F21] group-hover:bg-[#FF4F21]/20 transition-all duration-500 shrink-0">
                  {item.icon}
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                  {item.title.split(' ')[0]} <br />
                  <span className="text-[#FF4F21]">{item.title.split(' ').slice(1).join(' ')}</span>
                </h3>

                <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                  <p className="text-zinc-200 text-xs md:text-sm pt-3 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="w-8 h-1 bg-[#FF4F21]/50 rounded-full group-hover:w-full group-hover:bg-[#FF4F21] transition-all duration-700 mt-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
