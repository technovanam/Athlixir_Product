'use client';

import React from 'react';
import Image from 'next/image';
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
      icon: <Activity size={22} className="text-[#FF4F21]" />,
      title: "Biomechanics Analysis",
      label: "Movement Intelligence",
      description: "Analyze cadence, stride length, GCT, posture mechanics, and sprint symmetry using AI-powered biomechanical tracking.",
      bgImg: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop",
    },
    {
      icon: <BarChart3 size={22} className="text-[#FF4F21]" />,
      title: "Performance Benchmarking",
      label: "Scientific Scoring",
      description: "Compare athlete performance against district, state, and elite sprint-performance benchmarks.",
      bgImg: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=600&auto=format&fit=crop",
    },
    {
      icon: <TrendingUp size={22} className="text-[#FF4F21]" />,
      title: "Athlete Evolution Tracking",
      label: "Progress Intelligence",
      description: "Track long-term sprint improvement, performance growth, injury-risk reduction, and biomechanical adaptation.",
      bgImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    }
  ];

  return (
    <section id="athletes" className="py-16 md:py-24 bg-[#F2F2F7] relative overflow-hidden font-poppins text-[#1C1C1E]">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex px-4 py-1.5 rounded-full border border-black/[0.05] bg-white text-[11px] font-bold uppercase tracking-[0.2em] mb-3 text-[#FF4F21] shadow-2xs">
            Athlete Intelligence System
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1C1E] tracking-tight leading-tight mt-1">
            Inside Athlete <br />
            <span className="text-[#FF4F21]">Performance Intelligence.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative group h-[380px] md:h-[420px] rounded-[28px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] bg-white flex flex-col justify-end"
            >
              {/* Card Photo */}
              <Image
                src={item.bgImg}
                alt={item.title}
                fill
                unoptimized
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Top Label */}
              <div className="absolute top-5 left-5 z-20">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-[#1C1C1E] shadow-2xs">
                  {item.label}
                </span>
              </div>

              {/* Card content at the bottom */}
              <div className="relative z-20 flex flex-col justify-end p-6">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-3 w-12 h-12 flex items-center justify-center text-white shrink-0">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                  {item.title}
                </h3>

                <p className="text-zinc-200 text-xs mt-2 font-normal leading-relaxed">
                  {item.description}
                </p>

                <div className="w-8 h-1 bg-[#FF4F21] rounded-full group-hover:w-full transition-all duration-500 mt-4" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TargetAudience;
