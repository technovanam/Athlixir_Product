'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Quote, Cpu } from 'lucide-react';

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

    // Stride parameters
    const thighLen = 35;
    const shinLen = 35;
    const armLen = 25;
    const forearmLen = 22;

    // Phase equations (Opposing limbs offset by PI)
    const pRight = time;
    const pLeft = time + Math.PI;

    // --- Right Leg (Foreground - highlighted) ---
    const thighAngleR = 0.55 * Math.sin(pRight) - 0.1;
    const kneeAngleR = 0.55 * Math.sin(pRight - 1.2) + 0.85;
    const kxR = cx + thighLen * Math.sin(thighAngleR);
    const kyR = cy + thighLen * Math.cos(thighAngleR);
    const axR = kxR + shinLen * Math.sin(thighAngleR - kneeAngleR);
    const ayR = kyR + shinLen * Math.cos(thighAngleR - kneeAngleR);
    const kneeAngleDegR = Math.round(kneeAngleR * (180 / Math.PI));

    // --- Left Leg (Background) ---
    const thighAngleL = 0.55 * Math.sin(pLeft) - 0.1;
    const kneeAngleL = 0.55 * Math.sin(pLeft - 1.2) + 0.85;
    const kxL = cx + thighLen * Math.sin(thighAngleL);
    const kyL = cy + thighLen * Math.cos(thighAngleL);
    const axL = kxL + shinLen * Math.sin(thighAngleL - kneeAngleL);
    const ayL = kyL + shinLen * Math.cos(thighAngleL - kneeAngleL);

    // --- Right Arm (Foreground) ---
    const armAngleR = 0.5 * Math.sin(pLeft);
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

    // Telemetry flags
    const isTouchdown = ayR > 185 || ayL > 185;

    // Force-plate telemetry points
    const graphPoints: string[] = [];
    for (let i = 0; i < 40; i++) {
        const gx = 45 + i * 5.4;
        const phaseOffset = time - i * 0.08;
        const gy = 320 - (18 * Math.sin(phaseOffset * 3) + 6 * Math.cos(phaseOffset * 6) + 2 * Math.sin(phaseOffset * 18));
        graphPoints.push(`${gx},${gy}`);
    }
    const graphPath = graphPoints.join(' ');

    return (
        <section id="research" className="py-16 md:py-24 bg-[#F2F2F7] relative overflow-hidden font-poppins text-[#1C1C1E]">
            <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                
                {/* Left Side: Real-time biomechanics dashboard */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative rounded-[28px] bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] h-[540px] overflow-hidden group flex flex-col justify-between p-6"
                >
                    {mounted ? (
                        <>
                            {/* Dashboard Header Panel */}
                            <div className="flex justify-between items-center bg-[#F2F2F7] border border-black/[0.04] px-4 py-2.5 rounded-2xl z-10">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-[#FF4F21] rounded-full animate-ping" />
                                    <span className="text-[10px] font-bold tracking-widest text-[#FF4F21] uppercase">ANALYZER ACTIVE</span>
                                </div>
                                <div className="flex items-center space-x-3 text-[10px] font-semibold text-[#8E8E93]">
                                    <span>FPS: <span className="text-[#34C759] font-bold">60.0</span></span>
                                    <span className="w-[1px] h-3 bg-slate-300" />
                                    <span>LATENCY: <span className="text-[#FF4F21] font-bold">12ms</span></span>
                                </div>
                            </div>

                            {/* Central Area: Animated Skeleton Runner */}
                            <div className="relative w-full h-[210px] flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 320 220">
                                    <line x1="20" y1="200" x2="300" y2="200" stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="3,3" />
                                    <line x1="20" y1="70" x2="300" y2="70" stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="3,3" />

                                    {/* Bounding box locator */}
                                    <rect 
                                        x={Math.min(axR, axL) - 15} 
                                        y={hy - 12} 
                                        width={Math.max(axR, axL) - Math.min(axR, axL) + 30} 
                                        height={200 - hy + 25} 
                                        fill="none" 
                                        stroke="#FF4F21" 
                                        strokeWidth="1" 
                                        strokeOpacity="0.2" 
                                        strokeDasharray="4,4" 
                                    />
                                    <text x={Math.min(axR, axL) - 15} y={hy - 22} fill="#FF4F21" className="text-[8px] font-bold tracking-widest">
                                        TARGET_ID: ATH_042
                                    </text>

                                    {/* SKELETON RENDER */}
                                    <line x1={cx} y1={cy} x2={kxL} y2={kyL} stroke="#FF4F21" strokeWidth="2.5" strokeOpacity="0.3" strokeLinecap="round" />
                                    <line x1={kxL} y1={kyL} x2={axL} y2={ayL} stroke="#FF4F21" strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
                                    <circle cx={kxL} cy={kyL} r="3" fill="#fff" stroke="#FF4F21" strokeWidth="1.5" />
                                    <circle cx={axL} cy={ayL} r="2.5" fill="#fff" stroke="#FF4F21" strokeWidth="1.5" />

                                    <line x1={sx} y1={sy} x2={exL} y2={eyL} stroke="#FF4F21" strokeWidth="2.5" strokeOpacity="0.3" strokeLinecap="round" />
                                    <line x1={exL} y1={eyL} x2={wxL} y2={wyL} stroke="#FF4F21" strokeWidth="2" strokeOpacity="0.25" strokeLinecap="round" />
                                    <circle cx={exL} cy={eyL} r="3" fill="#fff" stroke="#FF4F21" strokeWidth="1.5" />

                                    <line x1={cx} y1={cy} x2={kxR} y2={kyR} stroke="#FF4F21" strokeWidth="4.5" strokeLinecap="round" />
                                    <line x1={kxR} y1={kyR} x2={axR} y2={ayR} stroke="#FF4F21" strokeWidth="3.5" strokeLinecap="round" />
                                    <circle cx={kxR} cy={kyR} r="4.5" fill="#FF4F21" stroke="#fff" strokeWidth="1.5" />
                                    <circle cx={axR} cy={ayR} r="3.5" fill="#FF4F21" stroke="#fff" strokeWidth="1" />

                                    <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#1C1C1E" strokeWidth="5" strokeLinecap="round" />
                                    <circle cx={hx} cy={hy} r="7.5" fill="#FF4F21" stroke="#fff" strokeWidth="1.5" />

                                    <line x1={sx} y1={sy} x2={exR} y2={eyR} stroke="#1C1C1E" strokeWidth="3.5" strokeLinecap="round" />
                                    <line x1={exR} y1={eyR} x2={wxR} y2={wyR} stroke="#1C1C1E" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx={exR} cy={eyR} r="3.5" fill="#FF4F21" stroke="#fff" strokeWidth="1" />
                                    <circle cx={wxR} cy={wyR} r="3" fill="#FF4F21" stroke="#fff" strokeWidth="1" />

                                    <rect x={kxR + 25} y={kyR - 25} width={48} height={16} rx="4" fill="#1C1C1E" />
                                    <text x={kxR + 49} y={kyR - 14} fill="#fff" textAnchor="middle" className="text-[8px] font-bold">
                                        KNEE:{kneeAngleDegR}°
                                    </text>

                                    <rect x="22" y="16" width="76" height="18" rx="4" fill="#F2F2F7" />
                                    <text x="30" y="28" fill={isTouchdown ? "#FF4F21" : "#8E8E93"} className="text-[8px] font-bold tracking-wider">
                                        {isTouchdown ? "● TOUCHDOWN" : "○ FLIGHT PHASE"}
                                    </text>
                                </svg>
                            </div>

                            {/* Engine Capabilities Banner */}
                            <div className="p-3.5 rounded-2xl bg-[#F2F2F7] border border-black/[0.04] z-10">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Cpu className="w-3.5 h-3.5 text-[#FF4F21]" />
                                    <span className="text-[10px] font-bold text-[#1C1C1E] uppercase tracking-wider">ENGINE CAPABILITIES</span>
                                </div>
                                <p className="text-[#636366] font-normal text-xs leading-relaxed">
                                    Scientific sprint analysis using OpenCV, MediaPipe, and AI biomechanical intelligence.
                                </p>
                            </div>

                            {/* Mini Waveform & Telemetry Panel */}
                            <div className="grid grid-cols-3 gap-3 bg-[#F2F2F7] border border-black/[0.04] p-3 rounded-2xl z-10">
                                <div className="col-span-2 flex flex-col justify-between">
                                    <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">CADENCE WAVEFORM</span>
                                    <div className="h-[40px] mt-1 relative overflow-hidden bg-white rounded-xl border border-black/[0.04]">
                                        <svg className="w-full h-full" viewBox="40 280 220 55" preserveAspectRatio="none">
                                            <path d={`M ${graphPath}`} fill="none" stroke="#FF4F21" strokeWidth="2" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between border-l border-slate-200 pl-3">
                                    <div>
                                        <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">SYMMETRY</span>
                                        <div className="text-sm font-extrabold text-[#1C1C1E] mt-0.5">98.4%</div>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">GCT MIN</span>
                                        <div className="text-xs font-extrabold text-[#FF4F21] mt-0.5">88ms</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#FF4F21] animate-spin" />
                            <span className="text-xs font-bold text-[#8E8E93] uppercase mt-3">Loading Telemetry...</span>
                        </div>
                    )}
                </motion.div>

                {/* Right Side: Scientific Context */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div>
                        <div className="inline-flex px-4 py-1.5 rounded-full border border-black/[0.05] bg-white text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-[#FF4F21] shadow-2xs">
                            Research & Trust
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1C1E] leading-tight tracking-tight mt-1">
                            Built on Sports Science & <br />
                            <span className="text-[#FF4F21]">AI Intelligence.</span>
                        </h2>
                    </div>

                    <div className="relative py-6 px-7 rounded-[26px] bg-white border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
                        <Quote className="absolute -top-3 -right-3 w-20 h-20 text-[#FF4F21]/[0.06]" />

                        <p className="text-base font-medium italic text-[#1C1C1E] leading-relaxed mb-4 relative z-10">
                            “Elite sprint performance is measured in milliseconds. Athlixir transforms running videos into biomechanical intelligence that helps athletes improve scientifically.”
                        </p>
                        <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-[2px] bg-[#FF4F21] rounded-full" />
                            <p className="text-[11px] font-extrabold text-[#8E8E93] uppercase tracking-[0.2em]">
                                Sports Science Intelligence
                            </p>
                        </div>
                    </div>

                    <p className="text-[#636366] text-base leading-relaxed font-normal max-w-lg">
                        Athlixir combines AI, biomechanics, and performance analytics to help athletes understand sprint efficiency, reduce injury risks, and scientifically track long-term athletic evolution.
                    </p>

                    <button className="px-8 py-3.5 bg-white border border-black/[0.08] text-[#1C1C1E] font-bold rounded-full hover:bg-[#F2F2F7] transition-all text-xs uppercase tracking-widest active:scale-95 flex items-center space-x-2 cursor-pointer shadow-2xs">
                        <span>Explore Sprint Intelligence</span>
                        <ArrowRight size={14} />
                    </button>
                </motion.div>

            </div>
        </section>
    );
};

export default ResearchTrust;
