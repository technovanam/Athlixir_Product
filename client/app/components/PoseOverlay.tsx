'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal, ScanLine } from 'lucide-react';
import { STRIDE_SECONDS, bump, leg } from './gait';

type P = { x: number; y: number };

const TAU = Math.PI * 2;
const RAD = Math.PI / 180;

function pose(t: number, h: number) {
  const p = (t / STRIDE_SECONDS) % 1;
  // Body proportions as a fraction of stage height (runner stands ≈ 60% of the frame).
  const u = h * 0.62;
  const L = { torso: 0.29 * u, thigh: 0.23 * u, shank: 0.23 * u, foot: 0.075 * u, upper: 0.16 * u, fore: 0.15 * u, head: 0.052 * u };
  const lean = 10 + 2 * Math.cos(TAU * 2 * p);
  const dir = (deg: number, len: number): P => ({ x: Math.sin(deg * RAD) * len, y: Math.cos(deg * RAD) * len });
  const add = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y });

  const hip: P = { x: 0, y: 0 };
  const legPoints = (phase: number) => {
    const k = leg(phase);
    const knee = add(hip, dir(k.thigh, L.thigh));
    const shankAngle = k.thigh - k.kneeFlex;
    const ankle = add(knee, dir(shankAngle, L.shank));
    const toe = add(ankle, dir(shankAngle + 90 - k.plantar, L.foot));
    const heel = add(ankle, dir(shankAngle - 90, L.foot * 0.25));
    return { ...k, knee, ankle, toe, heel };
  };
  const near = legPoints(p);
  const far = legPoints((p + 0.5) % 1);

  const shoulder = add(hip, { x: Math.sin(lean * RAD) * L.torso, y: -Math.cos(lean * RAD) * L.torso });
  const neck = add(shoulder, { x: Math.sin(lean * RAD) * L.head * 0.9, y: -Math.cos(lean * RAD) * L.head * 0.9 });
  const head = add(neck, { x: Math.sin(lean * RAD) * L.head, y: -Math.cos(lean * RAD) * L.head });
  const armPoints = (phase: number) => {
    // Arms swing opposite to the same-side leg.
    const swing = -42 * Math.cos(TAU * (phase - 0.8));
    const elbowFlex = 80 + 18 * Math.cos(TAU * (phase - 0.3));
    const elbow = add(shoulder, dir(swing, L.upper));
    const wrist = add(elbow, dir(swing + elbowFlex, L.fore));
    return { elbow, wrist };
  };
  const nearArm = armPoints((p + 0.5) % 1);
  const farArm = armPoints(p);

  // Keep the lowest foot on the ground, with a little flight between steps.
  const lowest = Math.max(near.toe.y, near.heel.y, far.toe.y, far.heel.y);
  const flight = 0.018 * u * (bump(p, 0.4, 0.08) + bump(p, 0.9, 0.08));
  return { p, lean, hip, shoulder, neck, head, headR: L.head, near, far, nearArm, farArm, drop: -lowest - flight };
}

type Pose = ReturnType<typeof pose>;

const PoseOverlay: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [split, setSplit] = useState(0.42);
  const splitRef = useRef(split);
  splitRef.current = split;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth;
      h = stage.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    let onScreen = false;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(stage);

    const trail: (P & { t: number })[] = [];
    let clipX = 0; // left edge of the analysis side; labels stay to its right

    const background = (t: number, analysed: boolean) => {
      const ground = h * 0.8;
      const sky = ctx.createLinearGradient(0, 0, 0, ground);
      sky.addColorStop(0, analysed ? '#0c1018' : '#3b4656');
      sky.addColorStop(1, analysed ? '#151b26' : '#7b8796');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, ground);
      // Stadium wall and posts scrolling past, for a sense of speed.
      ctx.fillStyle = analysed ? '#1a2130' : '#2c3440';
      ctx.fillRect(0, ground - h * 0.16, w, h * 0.16);
      const speed = w * 1.3;
      const gap = w * 0.22;
      const off = (t * speed * 0.35) % gap;
      ctx.fillStyle = analysed ? '#232c3d' : '#46505e';
      for (let x = -off; x < w + gap; x += gap) ctx.fillRect(x, ground - h * 0.16, 4, h * 0.16);
      // Track.
      ctx.fillStyle = analysed ? '#2a1712' : '#b2482e';
      ctx.fillRect(0, ground, w, h - ground);
      ctx.strokeStyle = analysed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ground + (h - ground) * 0.55);
      ctx.lineTo(w, ground + (h - ground) * 0.55);
      ctx.stroke();
      const mark = w * 0.3;
      const moff = (t * speed) % mark;
      for (let x = -moff; x < w + mark; x += mark) ctx.fillRect(x, ground + 3, 3, (h - ground) * 0.4);
      if (analysed) {
        // Measurement grid.
        ctx.strokeStyle = 'rgba(120,160,255,0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
    };

    const toScreen = (q: Pose, pt: P): P => ({ x: w * 0.47 + pt.x, y: h * 0.8 + q.drop + pt.y });

    const silhouette = (q: Pose) => {
      const s = (pt: P) => toScreen(q, pt);
      const limb = (pts: P[], width: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach((pt, i) => (i ? ctx.lineTo(s(pt).x, s(pt).y) : ctx.moveTo(s(pt).x, s(pt).y)));
        ctx.stroke();
      };
      const u = (h * 0.62) / 100;
      // Far limbs first, darker, then torso, then near limbs.
      limb([q.shoulder, q.farArm.elbow, q.farArm.wrist], 3.2 * u, '#14161b');
      limb([q.hip, q.far.knee, q.far.ankle], 5 * u, '#14161b');
      limb([q.far.heel, q.far.toe], 2.6 * u, '#0b0c0f');
      limb([q.hip, q.shoulder], 9 * u, '#1d2026');
      limb([q.shoulder, q.neck], 3.2 * u, '#2a2420');
      const hd = s(q.head);
      ctx.fillStyle = '#2a2420';
      ctx.beginPath();
      ctx.arc(hd.x, hd.y, q.headR, 0, TAU);
      ctx.fill();
      limb([q.hip, q.near.knee, q.near.ankle], 5.4 * u, '#262a32');
      limb([q.near.heel, q.near.toe], 2.8 * u, '#ff5a1f');
      limb([q.shoulder, q.nearArm.elbow, q.nearArm.wrist], 3.4 * u, '#2a2e36');
    };

    const angleArc = (c: P, a: P, b: P, color: string, label: string) => {
      const a1 = Math.atan2(a.y - c.y, a.x - c.x);
      const a2 = Math.atan2(b.y - c.y, b.x - c.x);
      let d = a2 - a1;
      while (d > Math.PI) d -= TAU;
      while (d < -Math.PI) d += TAU;
      const r = h * 0.04;
      ctx.strokeStyle = color;
      ctx.fillStyle = color + '2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.arc(c.x, c.y, r, a1, a1 + d, d < 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, a1, a1 + d, d < 0);
      ctx.stroke();
      const mid = a1 + d / 2;
      let lx = c.x + Math.cos(mid + Math.PI) * r * 2.1;
      const ly = c.y + Math.sin(mid + Math.PI) * r * 2.1;
      ctx.font = `600 ${Math.max(11, h * 0.028)}px Poppins, system-ui, sans-serif`;
      const tw = ctx.measureText(label).width;
      lx = Math.max(lx, clipX + tw / 2 + 12);
      ctx.fillStyle = 'rgba(8,10,14,0.78)';
      ctx.beginPath();
      ctx.roundRect(lx - tw / 2 - 7, ly - 11, tw + 14, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, ly + 0.5);
    };

    const skeleton = (q: Pose, t: number) => {
      const s = (pt: P) => toScreen(q, pt);
      const bone = (a: P, b: P, color: string, width = 3) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s(a).x, s(a).y);
        ctx.lineTo(s(b).x, s(b).y);
        ctx.stroke();
      };
      const joint = (pt: P, color: string, r = 4.5) => {
        const v = s(pt);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(v.x, v.y, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };
      const farC = 'rgba(120,170,255,0.55)';
      const nearC = '#ffffff';
      bone(q.shoulder, q.farArm.elbow, farC);
      bone(q.farArm.elbow, q.farArm.wrist, farC);
      bone(q.hip, q.far.knee, farC);
      bone(q.far.knee, q.far.ankle, farC);
      bone(q.far.heel, q.far.toe, farC);
      bone(q.hip, q.shoulder, nearC, 3.5);
      bone(q.shoulder, q.neck, nearC);
      const hd = s(q.head);
      ctx.strokeStyle = nearC;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hd.x, hd.y, q.headR * 0.85, 0, TAU);
      ctx.stroke();
      bone(q.hip, q.near.knee, nearC, 3.5);
      bone(q.near.knee, q.near.ankle, nearC, 3.5);
      bone(q.near.heel, q.near.toe, nearC);
      bone(q.shoulder, q.nearArm.elbow, nearC);
      bone(q.nearArm.elbow, q.nearArm.wrist, nearC);

      // Ankle path over the last stride.
      const ankle = s(q.near.ankle);
      trail.push({ x: ankle.x, y: ankle.y, t });
      while (trail.length && (t - trail[0].t > STRIDE_SECONDS * 0.95 || t < trail[0].t)) trail.shift();
      ctx.strokeStyle = 'rgba(255,106,61,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      trail.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
      ctx.stroke();
      ctx.setLineDash([]);

      // Trunk lean against vertical.
      const hip = s(q.hip);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(hip.x, hip.y - h * 0.22);
      ctx.stroke();
      ctx.setLineDash([]);

      const knee = s(q.near.knee);
      angleArc(knee, s(q.hip), s(q.near.ankle), '#ff6a3d', `Knee ${Math.round(180 - q.near.kneeFlex)}°`);
      angleArc(hip, { x: hip.x, y: hip.y - 10 }, s(q.shoulder), '#7fb0ff', `Trunk ${Math.round(q.lean)}°`);

      for (const pt of [q.far.knee, q.far.ankle, q.farArm.elbow, q.farArm.wrist]) joint(pt, farC, 3.5);
      for (const pt of [q.shoulder, q.hip, q.near.ankle, q.near.toe, q.nearArm.elbow, q.nearArm.wrist]) joint(pt, '#ff6a3d');
      joint(q.near.knee, '#ff6a3d', 5.5);
    };

    const hud = (q: Pose, x0: number) => {
      const stance = q.p < 0.3;
      const fs = Math.max(10, h * 0.026);
      const rows: [string, string][] = [
        ['Phase', stance ? 'Stance' : 'Swing'],
        ['Cadence', '182 spm'],
        ['Contact', '196 ms'],
      ];
      const bw = 180;
      const x = Math.max(x0 + 12, w - bw - 16);
      if (x + bw > w) return;
      ctx.fillStyle = 'rgba(8,10,14,0.7)';
      ctx.beginPath();
      ctx.roundRect(x, 16, bw, 20 + rows.length * (fs + 10), 14);
      ctx.fill();
      ctx.textBaseline = 'middle';
      rows.forEach(([k, v], i) => {
        const y = 16 + 16 + i * (fs + 10) + fs / 2;
        ctx.font = `500 ${fs}px Poppins, system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(k, x + 14, y);
        ctx.font = `700 ${fs}px Poppins, system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillStyle = i === 0 && stance ? '#ff6a3d' : '#ffffff';
        ctx.fillText(v, x + bw - 14, y);
      });
    };

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen) return;
      // Reduced motion holds a single mid-swing frame; the divider still works.
      const t = reducedMotion ? 0.55 * STRIDE_SECONDS : (now - start) / 1000;
      const q = pose(t, h);
      const sx = w * splitRef.current;
      clipX = sx;

      background(t, false);
      silhouette(q);

      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, 0, w - sx, h);
      ctx.clip();
      background(t, true);
      silhouette(q);
      ctx.fillStyle = 'rgba(10,14,22,0.45)';
      ctx.fillRect(sx, 0, w - sx, h);
      skeleton(q, t);
      hud(q, sx);
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const dragging = useRef(false);
  const moveTo = (clientX: number) => {
    const rect = stageRef.current!.getBoundingClientRect();
    setSplit(Math.min(0.95, Math.max(0.05, (clientX - rect.left) / rect.width)));
  };

  return (
    <section
      id="pose-demo"
      className="py-12 sm:py-14 bg-[#FAFAFC] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
            >
              <ScanLine size={12} />
              <span>See What The AI Sees</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
            >
              Every frame,{' '}
              <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
                measured.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-[#636366] leading-relaxed mb-7"
            >
              Pose tracking turns ordinary footage into a moving skeleton. From it, Athlixir measures joint angles,
              trunk lean, foot strike and the timing of every step. Drag the divider to compare raw video with the
              analysis layer.
            </motion.p>
            <ul className="space-y-3">
              {[
                ['33 landmarks per frame', 'Shoulders, hips, knees, ankles, heels and toes tracked through the whole run.'],
                ['Joint angles in motion', 'Knee drive, hip extension and posture measured at each phase of the stride.'],
                ['Step timing', 'Ground contact and flight time from foot strike to toe-off give cadence and stride.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FF4F21]" />
                  <p className="text-sm text-[#636366] leading-relaxed">
                    <span className="font-semibold text-[#1C1C1E]">{title}.</span> {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              ref={stageRef}
              className="relative h-[56svh] min-h-[340px] max-h-[560px] rounded-[2rem] overflow-hidden border border-black/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.18)] bg-[#1b1f27] cursor-ew-resize select-none"
              style={{ touchAction: 'pan-y' }}
              onPointerDown={(e) => {
                dragging.current = true;
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                moveTo(e.clientX);
              }}
              onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
            >
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

              <span className="pointer-events-none absolute top-4 left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                Raw video
              </span>
              <span
                className="pointer-events-none absolute bottom-4 px-3 py-1 rounded-full bg-[#FF4F21] text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-opacity"
                style={{ left: `calc(${split * 100}% + 12px)`, opacity: split < 0.8 ? 1 : 0 }}
              >
                AI analysis
              </span>

              {/* Divider */}
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${split * 100}%` }}>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white text-[#1C1C1E] shadow-lg flex items-center justify-center">
                  <MoveHorizontal size={18} />
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={95}
                value={Math.round(split * 100)}
                onChange={(e) => setSplit(+e.target.value / 100)}
                aria-label="Compare raw video and AI analysis"
                className="sr-only"
              />
            </div>
            <p className="mt-3 text-[11px] text-[#8E8E93]">
              Illustrative animation. Your report is built from the same measurements taken on your own video.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PoseOverlay;
