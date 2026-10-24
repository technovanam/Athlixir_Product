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
      const lerpFactor = 0.08;
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
      className="relative h-[300vh] bg-[#F2F2F7] select-none font-poppins"
    >
      {/* Sticky viewport lock wrapper */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
        {/* Section title */}
        <div className="container mx-auto px-6 lg:px-12 mb-10 z-10">
          <span className="text-[#FF4F21] text-xs font-bold uppercase tracking-[0.25em] block mb-2">
            Inside the Athlixir Engine
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1C1E] leading-tight tracking-tight">
            Experience the <br />
            <span className="text-[#FF4F21]">Athlixir Advantage.</span>
          </h2>
        </div>

        {/* Horizontal Scroll Showcase */}
        <div className="horizontal-scroll flex space-x-6 px-6 lg:px-12 overflow-hidden scrollbar-none z-10 select-none pb-4">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="min-w-[270px] sm:min-w-[300px] md:min-w-[360px] h-[380px] md:h-[430px] relative rounded-[28px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.06] group bg-white flex-shrink-0 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300"
            >
              {/* Premium Card Image */}
              <Image
                src={card.img}
                alt={card.title}
                fill
                unoptimized
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Card Contents */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-10 flex flex-col justify-end">
                <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-[#FF4F21] mb-2 block">
                  0{index + 1}
                </span>

                <div className="flex justify-between items-end gap-3">
                  <div className="flex-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-300 mb-1 block">
                      {card.label}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">
                      {card.title}
                    </h3>
                  </div>

                  {/* Interactive Button */}
                  <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF4F21] group-hover:scale-110 shrink-0">
                    <ArrowRight size={18} />
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