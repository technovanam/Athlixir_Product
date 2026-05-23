'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Shield, Activity, Zap, ChevronRight } from 'lucide-react';

// Volumetric 3D Biomechanics Anatomical Heatmap Component (Matches user uploaded image)
const Biomech3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let localRotationY = 0;

    // Define 3D cylinders segments for the body mesh to form a volumetric figure
    const segments = [
      // Name, yMin, yMax, radMin, radMax, xOffset, slices, colorType
      { name: 'head', yMin: 0.72, yMax: 0.98, radMin: 0.12, radMax: 0.11, xOffset: 0, slices: 5, colorType: 'blue' },
      { name: 'torso_chest', yMin: 0.35, yMax: 0.65, radMin: 0.22, radMax: 0.25, xOffset: 0, slices: 6, colorType: 'purple' },
      { name: 'torso_abs', yMin: 0.12, yMax: 0.35, radMin: 0.18, radMax: 0.22, xOffset: 0, slices: 4, colorType: 'purple' },
      
      // Shoulders (Red heatmap indicators)
      { name: 'l_shoulder', yMin: 0.58, yMax: 0.68, radMin: 0.08, radMax: 0.08, xOffset: -0.25, slices: 3, colorType: 'red' },
      { name: 'r_shoulder', yMin: 0.58, yMax: 0.68, radMin: 0.08, radMax: 0.08, xOffset: 0.25, slices: 3, colorType: 'red' },

      // Arms (Blue/Purple heatmap)
      { name: 'l_upper_arm', yMin: 0.30, yMax: 0.58, radMin: 0.06, radMax: 0.07, xOffset: -0.32, slices: 4, colorType: 'blue' },
      { name: 'r_upper_arm', yMin: 0.30, yMax: 0.58, radMin: 0.06, radMax: 0.07, xOffset: 0.32, slices: 4, colorType: 'blue' },
      { name: 'l_forearm', yMin: 0.02, yMax: 0.30, radMin: 0.04, radMax: 0.06, xOffset: -0.36, slices: 4, colorType: 'blue' },
      { name: 'r_forearm', yMin: 0.02, yMax: 0.30, radMin: 0.04, radMax: 0.06, xOffset: 0.36, slices: 4, colorType: 'blue' },

      // Thighs (Gold/Orange heatmap)
      { name: 'l_thigh', yMin: -0.22, yMax: 0.10, radMin: 0.08, radMax: 0.11, xOffset: -0.13, slices: 5, colorType: 'gold' },
      { name: 'r_thigh', yMin: -0.22, yMax: 0.10, radMin: 0.08, radMax: 0.11, xOffset: 0.13, slices: 5, colorType: 'gold' },

      // Knees (Green heatmap highlights)
      { name: 'l_knee', yMin: -0.34, yMax: -0.22, radMin: 0.07, radMax: 0.08, xOffset: -0.13, slices: 3, colorType: 'green' },
      { name: 'r_knee', yMin: -0.34, yMax: -0.22, radMin: 0.07, radMax: 0.08, xOffset: 0.13, slices: 3, colorType: 'green' },

      // Calves/Legs (Cyan/Teal heatmap)
      { name: 'l_calf', yMin: -0.72, yMax: -0.34, radMin: 0.05, radMax: 0.07, xOffset: -0.13, slices: 5, colorType: 'cyan' },
      { name: 'r_calf', yMin: -0.72, yMax: -0.34, radMin: 0.05, radMax: 0.07, xOffset: 0.13, slices: 5, colorType: 'cyan' },
      
      // Feet
      { name: 'l_foot', yMin: -0.80, yMax: -0.72, radMin: 0.06, radMax: 0.07, xOffset: -0.13, slices: 2, colorType: 'cyan' },
      { name: 'r_foot', yMin: -0.80, yMax: -0.72, radMin: 0.06, radMax: 0.07, xOffset: 0.13, slices: 2, colorType: 'cyan' }
    ];

    // Build the 3D polygon mesh vertices and faces programmatically
    const vertices: { x: number; y: number; z: number; colorType: string }[] = [];
    const faces: { indices: number[]; colorType: string }[] = [];
    const pointsPerRing = 6; // 6-sided cylinder slices for sharp low-poly look

    segments.forEach((seg) => {
      const segmentStartVertexIdx = vertices.length;

      // Generate cylinder vertices
      for (let s = 0; s < seg.slices; s++) {
        const t = seg.slices > 1 ? s / (seg.slices - 1) : 0.5;
        const y = seg.yMin + t * (seg.yMax - seg.yMin);
        const r = seg.radMin + t * (seg.radMax - seg.radMin);

        for (let p = 0; p < pointsPerRing; p++) {
          const angle = (p / pointsPerRing) * Math.PI * 2;
          const x = seg.xOffset + Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          vertices.push({ x, y, z, colorType: seg.colorType });
        }
      }

      // Generate quad faces connecting consecutive rings
      for (let s = 0; s < seg.slices - 1; s++) {
        const ringStart = segmentStartVertexIdx + s * pointsPerRing;
        const nextRingStart = segmentStartVertexIdx + (s + 1) * pointsPerRing;

        for (let p = 0; p < pointsPerRing; p++) {
          const pNext = (p + 1) % pointsPerRing;
          
          const idx0 = ringStart + p;
          const idx1 = ringStart + pNext;
          const idx2 = nextRingStart + pNext;
          const idx3 = nextRingStart + p;

          faces.push({
            indices: [idx0, idx1, idx2, idx3],
            colorType: seg.colorType
          });
        }
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseRef.current = { x, y, isHovered: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovered = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 480;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mouse-driven rot Y and rot X calculations
      if (mouseRef.current.isHovered) {
        localRotationY += (mouseRef.current.x * 0.006 - localRotationY) * 0.1;
      } else {
        localRotationY += 0.012; // Slow elegant idle spin
      }

      const rotY = localRotationY;
      const rotX = mouseRef.current.isHovered ? mouseRef.current.y * 0.003 : 0.05;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const perspective = 200;
      const distance = 3.5;
      const avgScale = perspective / (perspective * 0.08 + distance);
      const targetHeightOnScreen = 230; // perfect visible full body height
      const scaleMultiplier = targetHeightOnScreen / (1.8 * avgScale);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 10; // perfectly centered vertically

      // Project vertices to 2D screen coordinates
      const projected = vertices.map((v) => {
        // Y-axis rotation
        const x1 = v.x * cosY - v.z * sinY;
        const z1 = v.x * sinY + v.z * cosY;

        // X-axis rotation
        const y2 = v.y * cosX - z1 * sinX;
        const z2 = v.y * sinX + z1 * cosX;

        // Perspective depth calculations
        const scale = perspective / (perspective * 0.08 + (distance + z2));
        const screenX = centerX + x1 * scaleMultiplier * scale;
        const screenY = centerY - y2 * scaleMultiplier * scale;

        return { x: screenX, y: screenY, z: z2 };
      });

      // Render bottom visual projection circle
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 140, 80, 24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 79, 33, 0.06)';
      ctx.stroke();

      // Depth sort faces (Painters Algorithm)
      const sortedFaces = faces
        .map((f) => {
          const avgZ = f.indices.reduce((sum, idx) => sum + projected[idx].z, 0) / f.indices.length;
          return { ...f, avgZ };
        })
        .sort((a, b) => b.avgZ - a.avgZ); // Draw furthest faces first

      // Color mapping matching your uploaded muscle heat map exactly
      const colorMap: Record<string, { fill: string; stroke: string }> = {
        blue: { fill: 'rgba(37, 99, 235, 0.42)', stroke: 'rgba(59, 130, 246, 0.25)' }, // Blue head/arms
        red: { fill: 'rgba(239, 68, 68, 0.48)', stroke: 'rgba(248, 113, 113, 0.3)' }, // Red shoulders
        purple: { fill: 'rgba(139, 92, 246, 0.40)', stroke: 'rgba(167, 139, 250, 0.25)' }, // Purple chest/core
        gold: { fill: 'rgba(245, 158, 11, 0.45)', stroke: 'rgba(251, 191, 36, 0.25)' }, // Gold/Orange thighs
        green: { fill: 'rgba(16, 185, 129, 0.48)', stroke: 'rgba(52, 211, 153, 0.3)' }, // Green knees
        cyan: { fill: 'rgba(6, 182, 212, 0.42)', stroke: 'rgba(34, 211, 238, 0.25)' } // Cyan calves/feet
      };

      // Draw all low-poly mesh faces
      ctx.shadowBlur = 0;
      sortedFaces.forEach((face) => {
        const colors = colorMap[face.colorType];
        ctx.fillStyle = colors.fill;
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        face.indices.forEach((idx, i) => {
          const p = projected[idx];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Render tracked knee joint labels for sports-science telemetry style
      const leftKneeIdx = segments.slice(0, 10).reduce((sum, s) => sum + s.slices * pointsPerRing, 0) + 1;
      if (projected[leftKneeIdx]) {
        const pk = projected[leftKneeIdx];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '8px monospace';
        ctx.fillText('KNEE: 142°', pk.x + 16, pk.y + 3);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(pk.x, pk.y);
        ctx.lineTo(pk.x + 12, pk.y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab pointer-events-auto z-10 animate-fadeIn" />;
};

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="pt-8 pb-16 md:pt-12 md:pb-24 bg-background relative overflow-hidden"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] z-0" />

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Left Side: Scientific Copy and 4 Biomechanics Feature Blocks */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold uppercase tracking-[0.25em] text-primary backdrop-blur-sm">
            About Athlixir
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
            Scientific Sprint Intelligence <br />
            <span className="text-primary">Built For Athlete Evolution.</span>
          </h2>

          <p className="text-base text-gray-400 leading-relaxed font-light max-w-xl">
            Athlixir is an AI-powered biomechanics platform that converts sprint videos into performance intelligence. We analyze mechanics, detect injury risks, and track athlete evolution.
          </p>

          {/* Grid of 4 Real Sports-Science Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            
            {/* Feature 1: Biomechanics Intelligence */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Biomechanics Intelligence
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  AI analysis of cadence, GCT, stride length, and symmetry.
                </p>
              </div>
            </div>

            {/* Feature 2: Performance Benchmarking */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Performance Benchmarking
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Compare sprints against state and elite-level norms.
                </p>
              </div>
            </div>

            {/* Feature 3: Injury Risk Detection */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Injury Risk Detection
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Detect overstride patterns and asymmetries early.
                </p>
              </div>
            </div>

            {/* Feature 4: Athlete Evolution Tracking */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Athlete Evolution Tracking
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track performance growth over time with AI telemetry.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6">
            <button className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,87,34,0.4)] text-sm uppercase tracking-widest hover:scale-105 cursor-pointer flex items-center gap-2">
              Explore Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Side: Biomechanical Telemetry & UI Dashboard snippets */}
        <div className="relative h-[500px] w-full flex items-center justify-center lg:justify-end">
          
          {/* Main Visual: AI Biomechanics Telemetry Screen */}
          <div className="relative h-[480px] w-full bg-[#08080C]/80 border border-white/[0.06] rounded-3xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center p-6 select-none backdrop-blur-md">
            
            {/* scanline screen overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none crt-flicker" />
            
            {/* Grid matrix pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* 3D Volumetric Sprinter Heatmap Canvas Renderer */}
            <Biomech3DCanvas />

            {/* Radar telemetry scanning lines */}
            <div className="absolute w-[150%] h-[1px] bg-primary/20 top-1/3 left-0 animate-[pulse_3s_infinite]" />

            {/* Badge overlay: Validated Sprint Intelligence */}
            <div className="absolute top-6 right-6 z-20 py-1.5 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-md shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-400">
                Validated Sprint Intelligence
              </span>
            </div>

            {/* Console HUD status */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>SYS.ENG // BIOMECH_SCAN_3D</span>
              <span className="text-zinc-400">FPS: 240 // ACTIVE_3D_RENDER</span>
            </div>

            {/* CARD 1: Sprint Metrics */}
            <motion.div
              className="absolute top-16 left-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-44 backdrop-blur-md"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-primary block mb-2.5">
                Sprint Telemetry
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Cadence</span>
                  <span className="font-bold text-white">182 SPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">GCT</span>
                  <span className="font-bold text-primary">118ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Stride</span>
                  <span className="font-bold text-white">2.2m</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: AI Performance Score */}
            <motion.div
              className="absolute bottom-6 right-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-48 backdrop-blur-md"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 block mb-2.5">
                Performance Diagnostics
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Perf. Score</span>
                  <span className="font-bold text-white">84 / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Efficiency</span>
                  <span className="font-bold text-emerald-400">Elite</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Injury Risk</span>
                  <span className="font-bold text-emerald-400">Low</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: Benchmarking Alert */}
            <motion.div
              className="absolute bottom-6 left-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-48 backdrop-blur-md"
              animate={{ x: [0, 6, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-blue-400 block mb-1">
                State-Level Benchmark
              </span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Top 12% Sprint Efficiency
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
