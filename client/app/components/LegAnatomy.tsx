'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Footprints, Layers, ScanEye, MousePointer2 } from 'lucide-react';
import { LAYER_STYLES } from './anatomy/layers';
import type { AnatomyStats, FocusId, HoveredStructure, LayerId } from './anatomy/layers';

// three.js stays out of the landing bundle until the section is near the viewport.
const AnatomyModel = dynamic(() => import('./anatomy/AnatomyModel'), { ssr: false });

const LAYER_ORDER: LayerId[] = ['muscles', 'bones', 'ligaments', 'arteries', 'veins'];

const FOCUS_OPTIONS: { id: FocusId; label: string; short?: string }[] = [
  { id: 'full', label: 'Full leg' },
  { id: 'hip', label: 'Hip' },
  { id: 'knee', label: 'Knee' },
  { id: 'foot', label: 'Ankle & foot', short: 'Foot' },
];

const LegAnatomy: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState<Record<LayerId, boolean>>({
    muscles: true,
    bones: true,
    ligaments: true,
    arteries: true,
    veins: true,
  });
  const [xray, setXray] = useState(false);
  const [focus, setFocus] = useState<FocusId>('full');
  const [stats, setStats] = useState<AnatomyStats | null>(null);
  const [hovered, setHovered] = useState<HoveredStructure | null>(null);

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

  const toggleLayer = (id: LayerId) => setVisible((v) => ({ ...v, [id]: !v[id] }));

  return (
    <section
      id="anatomy"
      // Desktop: exactly one screen tall; pt clears the floating navbar.
      className="py-12 sm:py-14 lg:py-0 lg:pt-24 lg:pb-14 lg:min-h-[100svh] lg:flex lg:items-center bg-[#F2F2F7] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#FF4F21]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
          {/* Copy and controls */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
            >
              <ScanEye size={12} />
              <span>Lower-Limb Anatomy</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
            >
              The machinery{' '}
              <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
                behind every stride.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-[#636366] leading-relaxed mb-8"
            >
              Cadence, ground contact and stride length all come from the muscles, bones and vessels of the leg.
              Rotate the model, peel back layers and hover any structure to see its name.
            </motion.p>

            {/* Layer toggles */}
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E8E93] mb-3 flex items-center gap-1.5">
                <Layers size={12} /> Layers
              </p>
              <div className="flex flex-wrap gap-2">
                {LAYER_ORDER.map((id) => {
                  const on = visible[id];
                  const count = stats?.byLayer[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleLayer(id)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                        on
                          ? 'bg-white border-black/[0.1] text-[#1C1C1E] shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                          : 'bg-transparent border-black/[0.06] text-[#8E8E93]'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: on ? LAYER_STYLES[id].color : 'transparent' }}
                      />
                      {LAYER_STYLES[id].label}
                      {count != null && <span className="text-[10px] text-[#8E8E93] tabular-nums">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => setXray((x) => !x)}
                aria-pressed={xray}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  xray
                    ? 'bg-[#FF4F21] text-white shadow-[0_2px_12px_rgba(255,79,33,0.25)]'
                    : 'bg-white border border-black/[0.1] text-[#1C1C1E]'
                }`}
              >
                <ScanEye size={13} />
                X-ray muscles
              </button>
              <span className="text-xs text-[#8E8E93]">See the deep arteries and veins through the muscles.</span>
            </div>

            <Link
              href="/running-anatomy"
              className="group mb-8 flex items-center gap-3 p-4 rounded-3xl bg-[#1C1C1E] text-white hover:bg-black transition-colors"
            >
              <span className="h-10 w-10 shrink-0 rounded-2xl bg-[#FF4F21] flex items-center justify-center">
                <Footprints size={18} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold">Watch the leg run</span>
                <span className="block text-xs text-white/60">The same model through a full sprint stride, with muscle activity.</span>
              </span>
              <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Structure readout */}
            <div className="hidden lg:block p-5 rounded-3xl bg-white border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[92px]">
              {hovered ? (
                <>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5"
                    style={{ color: hovered.layer === 'bones' || hovered.layer === 'ligaments' ? '#8E8E93' : LAYER_STYLES[hovered.layer].color }}
                  >
                    {LAYER_STYLES[hovered.layer].label}
                  </p>
                  <p className="text-lg font-bold text-[#1C1C1E] leading-snug">{hovered.name}</p>
                </>
              ) : (
                <div className="flex items-start gap-3 text-[#636366]">
                  <MousePointer2 size={16} className="mt-0.5 shrink-0 text-[#FF4F21]" />
                  <p className="text-sm leading-relaxed">
                    {stats
                      ? `${stats.structures} structures loaded. Hover or tap the model to identify a muscle, bone or vessel.`
                      : 'Hover or tap the model to identify a muscle, bone or vessel.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3D stage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              ref={stageRef}
              className="relative h-[70svh] min-h-[420px] max-h-[640px] lg:max-h-none lg:min-h-[480px] lg:h-[calc(100svh-13rem)] rounded-[2rem] overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#2a2a30_0%,#121215_55%,#0a0a0c_100%)] border border-black/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
            >
              {nearViewport && (
                <AnatomyModel visible={visible} xray={xray} focus={focus} onLoaded={setStats} onHover={setHovered} />
              )}

              {/* Focus presets */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 flex gap-1 p-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
                {FOCUS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFocus(option.id)}
                    aria-pressed={focus === option.id}
                    className={`flex-1 sm:flex-none whitespace-nowrap px-2 sm:px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide sm:tracking-wider transition-colors ${
                      focus === option.id ? 'bg-[#FF4F21] text-white' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="sm:hidden">{option.short ?? option.label}</span>
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* In-stage readout, so phones see the tapped structure next to the model */}
              <div className="pointer-events-none absolute top-4 left-5 right-5">
                {hovered ? (
                  <div className="inline-flex flex-col px-3.5 py-2 rounded-2xl bg-black/55 backdrop-blur border border-white/10">
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: LAYER_STYLES[hovered.layer].color }}
                    >
                      {LAYER_STYLES[hovered.layer].label}
                    </span>
                    <span className="text-sm font-semibold text-white leading-snug">{hovered.name}</span>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Drag to rotate</p>
                )}
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-[#8E8E93]">
              3D anatomy:{' '}
              <a
                href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/20 hover:text-[#FF4F21]"
              >
                BodyParts3D
              </a>{' '}
              © The Database Center for Life Science (DBCLS),{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/20 hover:text-[#FF4F21]"
              >
                CC BY 4.0
              </a>
              . Mitsuhashi et al. (2009),{' '}
              <a
                href="https://doi.org/10.1093/nar/gkn613"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/20 hover:text-[#FF4F21]"
              >
                Nucleic Acids Research
              </a>
              . Geometry packaged by{' '}
              <a
                href="https://github.com/ashemag/human-atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-black/20 hover:text-[#FF4F21]"
              >
                Human Atlas
              </a>
              , simplified and limited to the lower limb by Athlixir. Adult male reference anatomy for education, not for
              diagnosis.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LegAnatomy;
