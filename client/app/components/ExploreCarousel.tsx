'use client';

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CardItem {
  title: string;
  label: string;
  img: string;
}

const ExploreCarousel: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);

  const cards: CardItem[] = [
    {
      title: "AI Sprint Analysis",
      label: "BIOMECHANICS",
      img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1255&auto=format&fit=crop"
    },
    {
      title: "Cadence & GCT Tracking",
      label: "PERFORMANCE",
      img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "Injury Risk Detection",
      label: "PREVENTION",
      img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "Performance Benchmarks",
      label: "STANDARDS",
      img: "https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "Athlete Evolution Tracking",
      label: "EVOLUTION",
      img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1170&auto=format&fit=crop"
    },
    {
      title: "AI Performance Reports",
      label: "REPORTS",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1170&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollContainer = section.querySelector<HTMLElement>(".horizontal-scroll");
    if (!scrollContainer) return;

    let targetScrollLeft = 0;
    let currentScrollLeft = 0;
    let rafId: number;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      if (rect.top > 0) {
        targetScrollLeft = 0;
      } else if (rect.bottom <= window.innerHeight) {
        targetScrollLeft = maxScroll;
      } else {
        targetScrollLeft = -rect.top;
      }
    };

    const updateScroll = () => {
      // Smoothly interpolate current scroll position towards the target (lerp)
      const lerpFactor = 0.08; // Smoothness factor (lower = smoother)
      const diff = targetScrollLeft - currentScrollLeft;
      
      if (Math.abs(diff) > 0.5) {
        currentScrollLeft += diff * lerpFactor;
        scrollContainer.scrollLeft = currentScrollLeft;
      } else {
        currentScrollLeft = targetScrollLeft;
        scrollContainer.scrollLeft = currentScrollLeft;
      }

      rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId = requestAnimationFrame(updateScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section 
      id="explore"
      ref={sectionRef} 
      className="relative h-[300vh] bg-background select-none"
    >
      {/* Sticky viewport lock wrapper */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        {/* Background aesthetic highlights */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#FF4F21]/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Section title */}
        <div className="container mx-auto px-6 lg:px-12 mb-12 z-10">
          <span className="text-[#FF4F21] text-[10px] font-mono uppercase tracking-[0.3em] block mb-2 animate-pulse">
            Inside the Athlixir Engine
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Experience the <br />
            <span className="text-zinc-500">Advantage.</span>
          </h2>
        </div>

        {/* Horizontal Scroll Showcase */}
        <div className="horizontal-scroll flex space-x-8 px-6 lg:px-12 overflow-hidden scrollbar-none z-10 select-none pb-4">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              className="min-w-[270px] sm:min-w-[300px] md:min-w-[370px] h-[400px] md:h-[460px] relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group bg-white/[0.02] flex-shrink-0 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all duration-500"
            >
              {/* Premium Card Image - high brightness */}
              <Image
                src={card.img}
                alt={card.title}
                fill
                unoptimized
                className="absolute inset-0 w-full h-full object-cover opacity-80 md:opacity-85 transform transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Rich Visual Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

              {/* Card Contents */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-10 flex flex-col justify-end">
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#FF4F21] mb-3 block">
                  0{index + 1}
                </span>

                <div className="flex justify-between items-end gap-4">
                  <div className="flex-1">
                    <span className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase mb-1 block">
                      {card.label}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">
                      {card.title}
                    </h3>
                  </div>

                  {/* Interactive Button */}
                  <div className="bg-white/5 backdrop-blur-xl p-2.5 md:p-3.5 rounded-xl text-white border border-white/10 shadow-xl transition-all duration-300 group-hover:bg-[#FF4F21] group-hover:text-white group-hover:border-[#FF4F21]/30 group-hover:scale-110 flex-shrink-0">
                    <ArrowRight size={20} className="transform transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ExploreCarousel;