'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Activity, ArrowLeft, ArrowRight, Layers, Pause, Play, ScanEye } from 'lucide-react';
import Logo from '../components/Logo';
import { LAYER_STYLES } from '../components/anatomy/layers';
import type { HoveredStructure, LayerId } from '../components/anatomy/layers';
import type { RunFrame, RunView } from '../components/anatomy/RunningLegModel';
import { MUSCLE_GROUPS, TOE_OFF, phaseName } from '../components/gait';

const RunningLegModel = dynamic(() => import('../components/anatomy/RunningLegModel'), { ssr: false });

const LAYER_ORDER: LayerId[] = ['muscles', 'bones', 'ligaments', 'arteries', 'veins'];
const VIEWS: { id: RunView; label: string }[] = [
  { id: 'side', label: 'Side' },
  { id: 'three-quarter', label: '3/4' },
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
];
const SPEEDS = [0.25, 0.5, 1];

const signed = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(Math.round(v))}°`;

export default function RunningAnatomyPage() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.5);
  const [phase, setPhase] = useState(0);
  const [view, setView] = useState<RunView>('side');
  const [visible, setVisible] = useState<Record<LayerId, boolean>>({
    muscles: true,
    bones: true,
    ligaments: true,
    arteries: true,
    veins: true,
  });
  const [xray, setXray] = useState(false);
  const [activity, setActivity] = useState(true);
  const [frame, setFrame] = useState<RunFrame | null>(null);
  const [hovered, setHovered] = useState<HoveredStructure | null>(null);
  const frameRef = useRef<RunFrame | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  const onFrame = (f: RunFrame) => {
    frameRef.current = f;
    setFrame(f);
  };
  const togglePlay = () => {
    // Pause where the stride is now, instead of jumping back to the last scrub point.
    if (playing && frameRef.current) setPhase(frameRef.current.phase);
    setPlaying((p) => !p);
  };

  const shownPhase = playing ? frame?.phase ?? 0 : phase;
  const stance = shownPhase < TOE_OFF;

  return (
    <div className="min-h-[100svh] bg-[#0c0d10] text-white font-poppins">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 h-16 border-b border-white/[0.06]">
        <Link href="/" aria-label="Athlixir home">
          <Logo light />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#anatomy"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF4F21] hover:bg-[#E03E12] text-xs font-bold uppercase tracking-wider"
          >
            Get started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 p-4 sm:p-6 lg:h-[calc(100svh-4rem)]">
        {/* Stage */}
        <div className="relative h-[64svh] min-h-[420px] lg:h-auto lg:min-h-0 rounded-[2rem] overflow-hidden border border-white/[0.07] bg-[radial-gradient(ellipse_at_50%_35%,#2a2a30_0%,#121215_55%,#0a0a0c_100%)]">
          <RunningLegModel
            visible={visible}
            xray={xray}
            activity={activity}
            playing={playing}
            speed={speed}
            phase={phase}
            view={view}
            onFrame={onFrame}
            onHover={setHovered}
          />

          <div className="pointer-events-none absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-black/55 backdrop-blur border border-white/10 text-[11px] font-bold uppercase tracking-[0.14em]">
                <span className={`h-2 w-2 rounded-full ${stance ? 'bg-[#FF4F21]' : 'bg-[#7fb0ff]'}`} />
                {stance ? 'Stance' : 'Swing'} · {phaseName(shownPhase)}
                <span className="text-white/45 normal-case tracking-normal font-semibold">right leg</span>
              </span>
              {hovered && (
                <span className="inline-flex flex-col self-start px-3.5 py-2 rounded-2xl bg-black/55 backdrop-blur border border-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: LAYER_STYLES[hovered.layer].color }}>
                    {LAYER_STYLES[hovered.layer].label}
                  </span>
                  <span className="text-sm font-semibold leading-snug">{hovered.name}</span>
                </span>
              )}
            </div>
            <div className="pointer-events-auto flex gap-1 p-1 rounded-full bg-black/50 backdrop-blur border border-white/10">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-pressed={view === v.id}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    view === v.id ? 'bg-white text-[#1C1C1E]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Playback */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 p-2 pr-3 rounded-full bg-black/55 backdrop-blur border border-white/10">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className="h-9 w-9 shrink-0 rounded-full bg-[#FF4F21] hover:bg-[#E03E12] flex items-center justify-center"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <div className="relative flex-1 min-w-0">
              {/* Stance / swing bands behind the scrubber */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full overflow-hidden flex pointer-events-none">
                <span className="bg-[#FF4F21]/60" style={{ width: `${TOE_OFF * 100}%` }} />
                <span className="bg-white/15 flex-1" />
              </div>
              <input
                type="range"
                min={0}
                max={999}
                value={Math.round(shownPhase * 1000)}
                onChange={(e) => {
                  setPlaying(false);
                  setPhase(+e.target.value / 1000);
                }}
                aria-label="Stride phase"
                className="run-scrubber relative w-full"
              />
            </div>
            <div className="hidden sm:flex gap-0.5">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-pressed={speed === s}
                  className={`px-2 py-1 rounded-full text-[11px] font-bold tabular-nums ${
                    speed === s ? 'bg-white text-[#1C1C1E]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="lg:overflow-y-auto space-y-4" data-lenis-prevent>
          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.07]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF6A3D] mb-2">Anatomy in motion</p>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">The leg through a sprint stride</h1>
            <p className="text-sm text-white/60 leading-relaxed">
              Both legs run a modelled sprint cycle, half a stride apart. Slow it down, scrub to any phase and tap a
              structure to name it. Pause to identify parts by hovering.
            </p>
            <div className="sm:hidden flex gap-1 mt-4">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-pressed={speed === s}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold tabular-nums border ${
                    speed === s ? 'bg-white text-[#1C1C1E] border-white' : 'text-white/70 border-white/15'
                  }`}
                >
                  {s}× speed
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.07]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 mb-3">Right leg joint angles</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Hip', frame ? signed(frame.hip) : '—', 'flexion'],
                ['Knee', frame ? signed(frame.knee) : '—', 'flexion'],
                ['Ankle', frame ? signed(frame.ankle) : '—', frame && frame.ankle < 0 ? 'dorsiflexion' : 'plantarflexion'],
              ].map(([label, value, hint]) => (
                <div key={label} className="p-3 rounded-2xl bg-white/[0.04]">
                  <p className="text-[11px] text-white/50">{label}</p>
                  <p className="text-xl font-extrabold tabular-nums leading-tight">{value}</p>
                  <p className="text-[10px] text-white/40">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.07]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 flex items-center gap-1.5">
                <Activity size={12} /> Muscle activity
              </p>
              <button
                type="button"
                onClick={() => setActivity((a) => !a)}
                aria-pressed={activity}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activity ? 'bg-[#FF4F21] text-white' : 'border border-white/15 text-white/60'
                }`}
              >
                {activity ? 'Glow on' : 'Glow off'}
              </button>
            </div>
            <ul className="space-y-2">
              {MUSCLE_GROUPS.map((g) => {
                const value = frame?.activity[g.name] ?? 0;
                return (
                  <li key={g.id} className="grid grid-cols-[92px_minmax(0,1fr)_34px] items-center gap-2">
                    <span className="text-xs font-semibold text-white/80">{g.name}</span>
                    <span className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <span className="block h-full rounded-full bg-[#FF6A3D]" style={{ width: `${value * 100}%` }} />
                    </span>
                    <span className="text-[11px] text-white/50 tabular-nums text-right">{Math.round(value * 100)}%</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[10px] text-white/40 leading-relaxed">
              Right leg. Approximate on/off pattern from published sprint EMG studies, simplified for teaching.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.07]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 mb-3 flex items-center gap-1.5">
              <Layers size={12} /> Layers
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {LAYER_ORDER.map((id) => {
                const on = visible[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setVisible((v) => ({ ...v, [id]: !v[id] }))}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                      on ? 'border-white/20 text-white' : 'border-white/[0.08] text-white/40'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: on ? LAYER_STYLES[id].color : 'transparent' }}
                    />
                    {LAYER_STYLES[id].label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setXray((x) => !x)}
              aria-pressed={xray}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                xray ? 'bg-[#FF4F21] text-white' : 'border border-white/15 text-white/80'
              }`}
            >
              <ScanEye size={13} /> X-ray muscles
            </button>
          </div>

          <p className="px-1 text-[10px] leading-relaxed text-white/40">
            3D anatomy:{' '}
            <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              BodyParts3D
            </a>{' '}
            © DBCLS,{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              CC BY 4.0
            </a>
            , packaged by{' '}
            <a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              Human Atlas
            </a>
            . Rigged and animated by Athlixir with a modelled sprint cycle. For education, not diagnosis.
          </p>
        </aside>
      </main>

      <style>{`
        .run-scrubber { -webkit-appearance: none; appearance: none; background: transparent; height: 20px; cursor: pointer; }
        .run-scrubber::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 9999px; background: #fff; box-shadow: 0 0 0 3px rgba(255,79,33,.6); }
        .run-scrubber::-moz-range-thumb { height: 16px; width: 16px; border: 0; border-radius: 9999px; background: #fff; box-shadow: 0 0 0 3px rgba(255,79,33,.6); }
        .run-scrubber::-moz-range-track { background: transparent; }
      `}</style>
    </div>
  );
}
