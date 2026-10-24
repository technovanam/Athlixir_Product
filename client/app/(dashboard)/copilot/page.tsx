'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Activity, User, Sparkles, TrendingUp, Compass, RefreshCcw,
  Bot, Lightbulb, Trophy, ChevronRight, Target, UploadCloud,
  FileText, Timer, Footprints, Zap, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth, api } from '../../context/AuthContext';
import { unwrapApiData } from '../../utils/api';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

type ChatMessage = { id: string; role: string; content: string };

function buildWelcomeMessage(analysis: any, athleteName: string): string {
  const cadence = analysis?.metrics?.cadence ?? '—';
  const gct = analysis?.metrics?.gct ?? '—';
  const perf = analysis?.scores?.performanceScore ?? '—';
  return `Hello ${athleteName}! I am your AI Sprint Coach, synced to your latest 33-point biomechanics telemetry (Cadence: ${cadence} SPM, Ground Contact: ${gct} ms, Performance Score: ${perf}/100). Ask me anything about your sprint mechanics, technical cues, or targeted training drills.`;
}

export default function CopilotPage() {
  const { user } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const firstName = athleteName.split(' ')[0];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list) && list.length > 0) {
        const completed = list.filter((a: any) => a.status === 'COMPLETED');
        if (completed.length > 0) {
          completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLatestAnalysis(completed[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis for copilot', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  useEffect(() => {
    if (!loading && latestAnalysis) {
      setMessages([{ id: 'welcome', role: 'assistant', content: buildWelcomeMessage(latestAnalysis, firstName) }]);
    } else if (!loading && !latestAnalysis) {
      setMessages([]);
    }
  }, [loading, latestAnalysis, firstName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    if (!latestAnalysis) {
      setMessages((prev) => [
        ...prev,
        { id: `system-${Date.now()}`, role: 'system', content: 'Upload and complete a sprint video analysis on the dashboard before consulting the AI Sprint Coach.' },
      ]);
      return;
    }

    const userMsgText = input;
    const newMessage = { id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, role: 'user', content: userMsgText };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post(`/analysis/${latestAnalysis.id}/chat`, { message: userMsgText });
      const chatResult = unwrapApiData<{ reply?: string }>(res);
      const aiResponse = chatResult?.reply || (typeof chatResult === 'string' ? chatResult : null);
      if (!aiResponse) {
        throw new Error('Empty response from AI service');
      }
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error('Failed to get copilot response', err);
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Unable to reach the AI service. Check your connection and try again.';
      setMessages(prev => [...prev, { id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, role: 'system', content: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const PRESET_PROMPTS = [
    { text: 'How do I reduce my Ground Contact Time (GCT)?', icon: Footprints },
    { text: 'Analyze my knee drive & step frequency', icon: Timer },
    { text: 'Give me 3 drills for acceleration posture', icon: Sparkles },
    { text: 'Assess my hamstring injury risk factors', icon: ShieldCheck },
  ];

  const handleSelectSuggestion = (text: string) => {
    setInput(text);
    if (inputRef.current) inputRef.current.focus();
  };

  const cadence: number | null = latestAnalysis?.metrics?.cadence ?? null;
  const gct: number | null = latestAnalysis?.metrics?.gct ?? null;
  const strideLength: number | null = latestAnalysis?.metrics?.strideLength ?? null;
  const symmetry: number | null = latestAnalysis?.metrics?.symmetry ?? null;
  const readinessScore: number | null = latestAnalysis?.scores?.performanceScore ?? null;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · KINEMATIC AI INTELLIGENCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            AI Sprint Coach <Sparkles size={24} className="text-[#FF4F21]" />
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (latestAnalysis) {
                setMessages([{ id: 'welcome-reset', role: 'assistant', content: buildWelcomeMessage(latestAnalysis, firstName) }]);
              } else {
                setMessages([]);
              }
            }}
            disabled={!latestAnalysis}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            <RefreshCcw size={13} className="text-[#8E8E93]" />
            <span>Reset Chat</span>
          </button>

          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Sprint Video</span>
          </Link>
        </div>
      </div>

      {fetchError && !loading && (
        <DataFetchError error={fetchError} onRetry={fetchLatest} />
      )}

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Telemetry & Weakness Prompts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Synchronized Telemetry Tile */}
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-bold">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1C1C1E]">
                    Synced Telemetry
                  </h3>
                  <span className="text-[10px] text-[#8E8E93] font-medium">
                    {latestAnalysis ? `Session #${latestAnalysis.id?.slice(0, 8)}` : 'Awaiting session'}
                  </span>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Readiness
                </span>
                <span className="text-xl font-black text-[#1C1C1E] mt-0.5 block">
                  {readinessScore !== null ? readinessScore : '—'}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">/ 100</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Cadence
                </span>
                <span className="text-xl font-black text-[#1C1C1E] mt-0.5 block">
                  {cadence !== null ? cadence : '—'}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">SPM</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Contact Time
                </span>
                <span className="text-xl font-black text-[#1C1C1E] mt-0.5 block">
                  {gct !== null ? gct : '—'}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">ms</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Symmetry
                </span>
                <span className="text-xl font-black text-[#1C1C1E] mt-0.5 block">
                  {symmetry !== null ? `${symmetry}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Technical Prompts */}
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] flex items-center gap-1.5">
              <Lightbulb size={14} className="text-[#FF9500]" /> Recommended Technical Cues
            </h3>
            <div className="space-y-2">
              {PRESET_PROMPTS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(preset.text)}
                    className="w-full text-left p-3 rounded-2xl bg-[#F8F8FA] hover:bg-[#FFF5F2] hover:border-[#FF4F21]/30 border border-black/[0.03] transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-xl bg-white text-[#FF4F21] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#FF4F21] group-hover:text-white transition-colors">
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-[#1C1C1E] group-hover:text-[#FF4F21] truncate transition-colors">
                        {preset.text}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-[#8E8E93] group-hover:text-[#FF4F21] group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Chat Area (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs flex flex-col h-[660px]">
            
            {/* Chat Messages Scroll Window */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!latestAnalysis && !loading && (
                <div className="p-8 text-center space-y-3">
                  <Bot size={36} className="text-[#FF4F21] mx-auto" />
                  <h4 className="text-base font-black text-[#1C1C1E]">No Biomechanics Session Loaded</h4>
                  <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
                    Upload a sprint video on the dashboard to provide the AI Copilot with precise joint angle telemetry.
                  </p>
                  <Link
                    href="/dashboard?tab=biomechanics"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] transition"
                  >
                    <UploadCloud size={14} />
                    <span>Upload Sprint Video</span>
                  </Link>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id || `msg-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 max-w-[88%] sm:max-w-[82%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-[#1C1C1E] text-white'
                          : 'bg-[#FF4F21] text-white'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User size={16} />
                      ) : (
                        <Bot size={17} />
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-[24px] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#FF4F21] text-white font-semibold shadow-xs shadow-[#FF4F21]/20 rounded-tr-sm'
                          : 'bg-[#F8F8FA] border border-black/[0.04] text-[#1C1C1E] font-medium rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 max-w-[80%]"
                  >
                    <div className="shrink-0 h-9 w-9 rounded-2xl bg-[#FF4F21] text-white flex items-center justify-center shadow-xs">
                      <Bot size={17} />
                    </div>
                    <div className="p-4 rounded-[24px] rounded-tl-sm bg-[#F8F8FA] border border-black/[0.04] flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#FF4F21] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-[#FF4F21] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-[#FF4F21] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <div className="pt-4 border-t border-black/[0.06] mt-3">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!latestAnalysis || isTyping}
                  placeholder={latestAnalysis ? 'Ask about kinematics, drills, contact time, or race strategy...' : 'Complete a sprint analysis to chat...'}
                  className="w-full bg-[#F8F8FA] border border-black/[0.08] rounded-2xl pl-5 pr-14 py-4 text-sm text-[#1C1C1E] placeholder-[#8E8E93] outline-none focus:border-[#FF4F21] focus:bg-white focus:ring-4 focus:ring-[#FF4F21]/10 transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping || !latestAnalysis}
                  className="absolute right-2.5 h-10 w-10 rounded-xl bg-[#FF4F21] text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition shadow-sm hover:bg-[#E03E12] cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="text-center mt-2.5">
                <span className="text-[10px] font-semibold text-[#8E8E93] flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} className="text-[#34C759]" />
                  AI Sprint Coach evaluates 33-point markerless computer vision coordinates
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
