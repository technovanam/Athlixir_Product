'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Microscope, Quote, Activity, Cpu } from 'lucide-react';

const ResearchTrust = () => {
    const [time, setTime] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Dynamic state update loop for 60 FPS skeleton running simulation
    useEffect(() => {
        setMounted(true);
        let animId: number;
        const tick = () => {
            setTime(t => t + 0.06);
            animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, []);

    // Biomechanics Sprinter Coordinates Generator (Double-pendulum skeletal projection)
    const cx = 150; // Hip X coordinate center
    const cy = 130 + 4 * Math.sin(time * 2); // Hip Y center with vertical oscillation

    const sx = cx + 4 * Math.sin(time); // Shoulder X
    const sy = cy - 50; // Shoulder Y

    const hx = sx + 6; // Head X
    const hy = sy - 18; // Head Y

    // Stride parameters (slightly scaled down to prevent any overflow)
    const thighLen = 35;
    const shinLen = 35;
    const armLen = 25;
    const forearmLen = 22;

    // Phase equations (Opposing limbs offset by PI)
    const pRight = time;
    const pLeft = time + Math.PI;

    // --- Right Leg (Foreground - highlighted) ---
    const thighAngleR = 0.55 * Math.sin(pRight) - 0.1;
    const kneeAngleR = 0.55 * Math.sin(pRight - 1.2) + 0.85; // Flexion angle
    const kxR = cx + thighLen * Math.sin(thighAngleR);
    const kyR = cy + thighLen * Math.cos(thighAngleR);
    const axR = kxR + shinLen * Math.sin(thighAngleR - kneeAngleR);
    const ayR = kyR + shinLen * Math.cos(thighAngleR - kneeAngleR);
    const kneeAngleDegR = Math.round(kneeAngleR * (180 / Math.PI));

    // --- Left Leg (Background - dimmed) ---
    const thighAngleL = 0.55 * Math.sin(pLeft) - 0.1;
    const kneeAngleL = 0.55 * Math.sin(pLeft - 1.2) + 0.85;
    const kxL = cx + thighLen * Math.sin(thighAngleL);
    const kyL = cy + thighLen * Math.cos(thighAngleL);
    const axL = kxL + shinLen * Math.sin(thighAngleL - kneeAngleL);
    const ayL = kyL + shinLen * Math.cos(thighAngleL - kneeAngleL);
    const kneeAngleDegL = Math.round(kneeAngleL * (180 / Math.PI));

    // --- Right Arm (Foreground) ---
    const armAngleR = 0.5 * Math.sin(pLeft); // Arm opposes corresponding leg
    const elbowAngleR = 0.45 * Math.sin(pLeft - 1.5) + 1.1;
    const exR = sx + armLen * Math.sin(armAngleR);
    const eyR = sy + armLen * Math.cos(armAngleR);
    const wxR = exR + forearmLen * Math.sin(armAngleR + elbowAngleR);
    const wyR = eyR + forearmLen * Math.cos(armAngleR + elbowAngleR);

    // --- Left Arm (Background) ---
    const armAngleL = 0.5 * Math.sin(pRight);
    const elbowAngleL = 0.45 * Math.sin(pRight - 1.5) + 1.1;
    const exL = sx + armLen * Math.sin(armAngleL);
    const eyL = sy + armLen * Math.cos(armAngleL);
    const wxL = exL + forearmLen * Math.sin(armAngleL + elbowAngleL);
    const wyL = eyL + forearmLen * Math.cos(armAngleL + elbowAngleL);

    // Telemetry flags: Detect touchdown ground contact based on vertical ankle position
    const isTouchdown = ayR > 185 || ayL > 185;

    // Generate real-time force-plate telemetry graph points
    const graphPoints: string[] = [];
    for (let i = 0; i < 40; i++) {
        const gx = 45 + i * 5.4;
        const phaseOffset = time - i * 0.08;
        // Periodic footstrike load waveform with high-frequency telemetry noise
        const gy = 320 - (18 * Math.sin(phaseOffset * 3) + 6 * Math.cos(phaseOffset * 6) + 2 * Math.sin(phaseOffset * 18));
        graphPoints.push(`${gx},${gy}`);
    }
    const graphPath = graphPoints.join(' ');

    return (
        <section id="research" className="pt-8 pb-16 md:pt-12 md:pb-24 bg-transparent relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF4F21]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                {/* Left Side: Real-time biomechanics dashboard simulation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative rounded-[2.5rem] bg-[#0c0c0e]/90 border border-white/10 shadow-2xl h-[550px] overflow-hidden group flex flex-col justify-between p-6"
                >
                    {mounted ? (
                        <>
                            {/* Retro Grid Background */}
                            <div 
                                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                style={{ 
                                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', 
                                    backgroundSize: '24px 24px' 
                                }} 
                            />

                            {/* Dashboard Header Panel */}
                            <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl backdrop-blur-sm z-10">
                                <div className="flex items-center space-x-2.5">
                                    <span className="w-2 h-2 bg-[#FF4F21] rounded-full animate-ping" />
                                    <span className="text-[10px] font-mono tracking-widest text-[#FF4F21] font-bold">ANALYZER ACTIVE</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[9px] font-mono text-zinc-500">
                                    <span>FPS: <span className="text-emerald-500">60.0</span></span>
                                    <span className="w-[1px] h-3 bg-zinc-800" />
                                    <span>LATENCY: <span className="text-orange-500">12ms</span></span>
                                </div>
                            </div>

                            {/* Central Area: Animated Skeleton Runner */}
                            <div className="relative w-full h-[210px] flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 320 220">
                                    {/* Horizontal target tracking grids */}
                                    <line x1="20" y1="200" x2="300" y2="200" stroke="rgba(255,79,33,0.15)" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="20" y1="70" x2="300" y2="70" stroke="rgba(255,79,33,0.08)" strokeWidth="1" strokeDasharray="3,3" />

                                    {/* Bounding box locator */}
                                    <rect 
                                        x={Math.min(axR, axL) - 15} 
                                        y={hy - 12} 
                                        width={Math.max(axR, axL) - Math.min(axR, axL) + 30} 
                                        height={200 - hy + 25} 
                                        fill="none" 
                                        stroke="#FF4F21" 
                                        strokeWidth="1" 
                                        strokeOpacity="0.12" 
                                        strokeDasharray="4,4" 
                                    />
                                    <text x={Math.min(axR, axL) - 15} y={hy - 22} fill="#FF4F21" fillOpacity="0.5" className="text-[7px] font-mono font-bold tracking-widest">
                                        TARGET_ID: ATH_042
                                    </text>

                                    {/* SKELETON RENDER */}
                                    
                                    {/* Left Leg (Background - dim orange) */}
                                    <line x1={cx} y1={cy} x2={kxL} y2={kyL} stroke="#FF4F21" strokeWidth="2.5" strokeOpacity="0.25" strokeLinecap="round" />
                                    <line x1={kxL} y1={kyL} x2={axL} y2={ayL} stroke="#FF4F21" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
                                    <circle cx={kxL} cy={kyL} r="3" fill="#000" stroke="#FF4F21" strokeWidth="1.5" strokeOpacity="0.3" />
                                    <circle cx={axL} cy={ayL} r="2.5" fill="#000" stroke="#FF4F21" strokeWidth="1.5" strokeOpacity="0.3" />

                                    {/* Left Arm (Background - dim orange) */}
                                    <line x1={sx} y1={sy} x2={exL} y2={eyL} stroke="#FF4F21" strokeWidth="2.5" strokeOpacity="0.25" strokeLinecap="round" />
                                    <line x1={exL} y1={eyL} x2={wxL} y2={wyL} stroke="#FF4F21" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
                                    <circle cx={exL} cy={eyL} r="3" fill="#000" stroke="#FF4F21" strokeWidth="1.5" strokeOpacity="0.3" />

                                    {/* Right Leg (Foreground - bright orange) */}
                                    <line x1={cx} y1={cy} x2={kxR} y2={kyR} stroke="#FF4F21" strokeWidth="4.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(255,79,33,0.3)]" />
                                    <line x1={kxR} y1={kyR} x2={axR} y2={ayR} stroke="#FF4F21" strokeWidth="3.5" strokeLinecap="round" />
                                    
                                    {/* Right Leg joint nodes */}
                                    <circle cx={kxR} cy={kyR} r="4.5" fill="#FF4F21" stroke="#fff" strokeWidth="1.5" />
                                    <circle cx={axR} cy={ayR} r="3.5" fill="#FF4F21" stroke="#fff" strokeWidth="1" />

                                    {/* Torso & Head */}
                                    <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#FF4F21" strokeWidth="5.5" strokeLinecap="round" />
                                    <circle cx={hx} cy={hy} r="7.5" fill="#FF4F21" stroke="#fff" strokeWidth="1.5" />

                                    {/* Right Arm (Foreground - bright orange) */}
                                    <line x1={sx} y1={sy} x2={exR} y2={eyR} stroke="#FF4F21" strokeWidth="4" strokeLinecap="round" />
                                    <line x1={exR} y1={eyR} x2={wxR} y2={wyR} stroke="#FF4F21" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx={exR} cy={eyR} r="3.5" fill="#FF4F21" stroke="#fff" strokeWidth="1" />
                                    <circle cx={wxR} cy={wyR} r="3" fill="#FF4F21" stroke="#fff" strokeWidth="1" />

                                    {/* Dynamic Knee Extension Callout Label */}
                                    <path d={`M ${kxR} ${kyR} L ${kxR + 25} ${kyR - 15}`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                                    <rect x={kxR + 25} y={kyR - 25} width={45} height={16} rx="4" fill="rgba(12,12,14,0.85)" stroke="rgba(255,79,33,0.3)" strokeWidth="0.8" />
                                    <text x={kxR + 47} y={kyR - 14} fill="#fff" textAnchor="middle" className="text-[8px] font-mono font-black">
                                        KNEE:{kneeAngleDegR}°
                                    </text>

                                    {/* Touchdown indicator text */}
                                    <rect x="22" y="16" width="70" height="18" rx="4" fill="rgba(12,12,14,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                                    <text x="32" y="28" fill={isTouchdown ? "#FF4F21" : "#52525b"} className="text-[7px] font-mono font-bold tracking-widest">
                                        {isTouchdown ? "● TOUCHDOWN" : "○ FLIGHT PHASE"}
                                    </text>
                                </svg>
                            </div>

                            {/* Integrated Engine Capabilities banner (Normal Flow - No overlap!) */}
                            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 z-10 select-none">
                                <div className="flex items-center space-x-2.5 mb-1.5">
                                    <Cpu className="w-3.5 h-3.5 text-[#FF4F21]" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ENGINE CAPABILITIES</span>
                                </div>
                                <p className="text-zinc-300 font-normal text-xs leading-relaxed">
                                    Scientific sprint analysis using OpenCV, MediaPipe, and AI-powered biomechanical intelligence.
                                </p>
                            </div>

                            {/* Mini Waveform & Telemetry Dashboard Panel */}
                            <div className="grid grid-cols-3 gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl z-10">
                                {/* Cadence Telemetry wave graph */}
                                <div className="col-span-2 flex flex-col justify-between">
                                    <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">CADENCE WAVEFORM</span>
                                    <div className="h-[42px] mt-1 relative overflow-hidden bg-black/40 rounded-lg border border-white/5">
                                        <svg className="w-full h-full" viewBox="40 280 220 55" preserveAspectRatio="none">
                                            <path d={`M ${graphPath}`} fill="none" stroke="#FF4F21" strokeWidth="1.8" className="drop-shadow-[0_0_4px_rgba(255,79,33,0.45)]" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Text Telemetry Data stats */}
                                <div className="flex flex-col justify-between border-l border-zinc-800/80 pl-3">
                                    <div>
                                        <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">SYMMETRY</span>
                                        <div className="text-sm font-mono font-black text-white mt-0.5">98.4%</div>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">GCT MIN</span>
                                        <div className="text-xs font-mono font-black text-[#FF4F21] mt-0.5">88ms</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FF4F21] animate-spin" />
                            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-4">Initializing Telemetry...</span>
                        </div>
                    )}
                </motion.div>

                {/* Right Side: Scientific context and value proposition */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-10"
                >
                    <div>
                        <div className="inline-flex px-5 py-2 rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/10 text-[11px] font-bold uppercase tracking-[0.25em] mb-4 text-[#FF4F21] backdrop-blur-sm">
                            Research & Trust
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mt-2">
                            Built on Sports Science & <br />
                            <span className="text-zinc-500">AI Intelligence.</span>
                        </h2>
                    </div>

                    {/* Core science-centric quote container */}
                    <div className="relative py-5 px-8 rounded-2xl bg-white/[0.02] border border-[#FF4F21]/30 shadow-[0_0_25px_rgba(255,79,33,0.03)] overflow-hidden group hover:border-[#FF4F21]/60 transition-all duration-300">
                        <Quote className="absolute -top-4 -right-4 w-24 h-24 text-[#FF4F21]/5 group-hover:text-[#FF4F21]/10 transition-colors" />

                        <p className="text-base md:text-lg font-light italic text-zinc-300 leading-relaxed mb-4 relative z-10">
                            “Elite sprint performance is measured in milliseconds. Athlixir transforms running videos into biomechanical intelligence that helps athletes improve scientifically.”
                        </p>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-[1px] bg-[#FF4F21]" />
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                Sports Science Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Scientific repositioning paragraph */}
                    <p className="text-zinc-400 text-base leading-relaxed font-light max-w-lg">
                        Athlixir combines AI, biomechanics, and performance analytics to help athletes understand sprint efficiency, reduce injury risks, and scientifically track long-term athletic evolution.
                    </p>

                    {/* Call to Action Button */}
                    <button className="px-9 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:border-[#FF4F21] hover:text-[#FF4F21] transition-all text-[11px] uppercase tracking-widest flex items-center space-x-3 group w-fit cursor-pointer">
                        <span>Explore Sprint Intelligence</span>
                        <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={15} />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default ResearchTrust;
