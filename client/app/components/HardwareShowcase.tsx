'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Cpu, Footprints, Layers3, Shirt } from 'lucide-react';
import { PRODUCTS } from './gear/products';
import type { HoveredPart, ProductId } from './gear/products';

// three.js stays out of the landing bundle until the section is near the viewport.
const GearModel = dynamic(() => import('./gear/GearModel'), { ssr: false });

const ICONS: Record<ProductId, React.ElementType> = {
  sleeve: Shirt,
  insole: Footprints,
  pod: Cpu,
};

const HardwareShowcase: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [product, setProduct] = useState<ProductId>('sleeve');
  const [exploded, setExploded] = useState(false);
  const [hovered, setHovered] = useState<HoveredPart | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = PRODUCTS.find((p) => p.id === product)!;

  return (
    <section
      id="hardware"
      // Desktop: exactly one screen tall; pt clears the floating navbar.
      className="py-12 sm:py-14 lg:py-0 lg:pt-24 lg:pb-14 lg:min-h-[100svh] lg:flex lg:items-center bg-[#FAFAFC] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF4F21]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-14 items-center">
          {/* Copy and controls — first on phones, right column on desktop */}
          <div className="lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
            >
              <Cpu size={12} />
              <span>Athlixir Hardware · Coming Soon</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
            >
              Optional gear for{' '}
              <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
                deeper data.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-[#636366] leading-relaxed mb-7"
            >
              Video analysis works with just your phone. The sleeve, insole and pod add on-body sensing for athletes who
              want more. Rotate each one, open the exploded view and hover a part to see what it is.
            </motion.p>

            {/* Product picker */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
              {PRODUCTS.map((p) => {
                const Icon = ICONS[p.id];
                const on = p.id === product;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProduct(p.id)}
                    aria-pressed={on}
                    className={`text-left p-3 sm:p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                      on
                        ? 'bg-white border-[#FF4F21]/40 shadow-[0_8px_24px_rgba(255,79,33,0.12)]'
                        : 'bg-white/60 border-black/[0.07] hover:bg-white'
                    }`}
                  >
                    <span
                      className={`h-9 w-9 rounded-xl flex items-center justify-center mb-2.5 ${
                        on ? 'bg-[#FF4F21] text-white' : 'bg-[#F2F2F7] text-[#636366]'
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="block text-xs sm:text-sm font-bold leading-tight">{p.name}</span>
                    <span className="block text-[10px] sm:text-[11px] text-[#8E8E93] mt-0.5">{p.tagline}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-[#636366] leading-relaxed min-h-[60px]">{current.description}</p>
          </div>

          {/* 3D stage */}
          <motion.div
            className="lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              ref={stageRef}
              className="relative h-[60svh] min-h-[380px] max-h-[600px] lg:max-h-none lg:min-h-[480px] lg:h-[calc(100svh-11rem)] rounded-[2rem] overflow-hidden bg-[radial-gradient(ellipse_at_45%_45%,#33363d_0%,#1b1c20_55%,#0e0f11_100%)] border border-black/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            >
              {nearViewport && <GearModel product={product} exploded={exploded} onHover={setHovered} />}

              <div className="pointer-events-none absolute top-4 left-5 right-5">
                {hovered ? (
                  <div className="inline-flex flex-col px-3.5 py-2 rounded-2xl bg-black/55 backdrop-blur border border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF6A3D]">{current.name}</span>
                    <span className="text-sm font-semibold text-white leading-snug">{hovered.label}</span>
                    {hovered.sub && <span className="text-[11px] text-white/55 leading-snug">{hovered.sub}</span>}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Drag to rotate</p>
                )}
              </div>

              {/* Assembled / exploded switch */}
              <div className="absolute bottom-4 left-4 flex gap-1 p-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
                {[
                  { value: false, label: 'Assembled' },
                  { value: true, label: 'Exploded' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setExploded(option.value)}
                    aria-pressed={exploded === option.value}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      exploded === option.value ? 'bg-[#FF4F21] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {option.value && <Layers3 size={12} />}
                    {option.label} view
                  </button>
                ))}
              </div>

              <p className="pointer-events-none absolute bottom-6 right-5 hidden sm:block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                Concept render
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HardwareShowcase;
