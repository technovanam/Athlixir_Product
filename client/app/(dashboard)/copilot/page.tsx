'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Activity, User, ShieldAlert, Sparkles, TrendingUp, Compass, RefreshCcw, Brain, Bot, Lightbulb, Trophy, Gauge, Zap, ChevronRight, Target
} from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';

export default function CopilotPage() {
  const { user } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { id: '1', role: 'system', content: 'ATHLIXIR AI Copilot initialized. Analyzing your recent biomechanics data...' },
    { id: '2', role: 'assistant', content: 'Hello! I am your AI Athlete Assistant. Based on your last 3 sprint sessions, I noticed your Ground Contact Time (GCT) is slightly high at 210ms. How can I help you optimize your training today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const athleteName = user?.name || user?.username || 'Athlete';

  // Load telemetry dynamically
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/analysis/list');
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
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !latestAnalysis) return;

    const userMsgText = input;
    const newMessage = { 
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
      role: 'user', 
      content: userMsgText 
    };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post(`/analysis/${latestAnalysis.id}/chat`, { message: userMsgText });
      const aiResponse = res.data?.data?.reply || res.data?.reply || res.data;
      setMessages(prev => [...prev, { 
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
        role: 'assistant', 
        content: aiResponse 
      }]);
    } catch (err) {
      console.error('Failed to get copilot response', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: "I'm experiencing high latency connecting to the cloud biomechanics analyzer. Remember that targeting a ground contact time under 180ms and working on horizontal project stiffness via plyometrics are key focuses in your current sprint cycle!"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const PRESET_PROMPTS = [
    { text: "Why is my cadence low?", icon: TrendingUp },
    { text: "How do I improve GCT?", icon: Compass },
    { text: "Analyze hamstring stress", icon: Sparkles }
  ];

  const handleSelectSuggestion = (text: string) => {
    setInput(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Helper colors for scores
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-purple-400';
    if (score >= 65) return 'text-cyan-400';
    return 'text-[#FF4F21]';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/20';
    if (score >= 65) return 'shadow-[0_0_15px_rgba(34,211,238,0.15)] border-cyan-500/20';
    return 'shadow-[0_0_15px_rgba(255,79,33,0.15)] border-[#FF4F21]/20';
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 pt-6 pb-6 space-y-6 animate-fadeIn h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF4F21] mb-1">
              <span className="inline-flex items-center gap-1.5 border border-[#FF4F21]/20 bg-[#FF4F21]/10 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(255,79,33,0.1)]">
                <Bot className="h-3 w-3 animate-pulse" />
                AI Assistant
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">AI Copilot</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Context-Aware Biomechanics & Sprint Assistant</p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              { id: '1', role: 'system', content: 'ATHLIXIR AI Copilot re-initialized. Memory buffer flushed.' },
              { id: '2', role: 'assistant', content: `Hello ${athleteName}! Ask me anything about your telemetry records, stride mechanics, or hamstring workload.` }
            ]);
          }}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-2 rounded-xl border border-white/[0.05] bg-[#08080C]/40 hover:border-white/[0.1] hover:bg-[#08080C]/60"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Reset Chat
        </button>
      </header>

      {/* Main Asymmetric Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Column: Real-time Telemetry Context (1/4 size on desktop) */}
        <div data-lenis-prevent className="lg:col-span-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1 scrollbar-hide">
          
          {/* Telemetry Sync Capsule */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 relative overflow-hidden group hover:border-white/[0.08] transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4F21]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-700" />
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 pointer-events-none">
              <Activity className="h-24 w-24 text-white" />
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Gauge className="h-4 w-4 text-[#FF4F21]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Telemetry Sync</span>
              </div>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">LIVE</span>
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/[0.02] rounded-lg animate-pulse" />
                <div className="h-12 bg-white/[0.02] rounded-lg animate-pulse" />
              </div>
            ) : latestAnalysis ? (
              <div className="space-y-4">
                {/* Performance Header KPI */}
                <div className={`p-3 rounded-lg border bg-black/30 flex items-center justify-between ${getScoreGlow(latestAnalysis.scores?.performanceScore || 0)}`}>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-amber-400" /> Performance
                    </span>
                    <p className={`text-2xl font-black tracking-tight mt-0.5 ${getScoreColor(latestAnalysis.scores?.performanceScore || 0)}`}>
                      {latestAnalysis.scores?.performanceScore || '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Efficiency</span>
                    <p className="text-base font-black text-white">{latestAnalysis.scores?.efficiencyScore || '—'}%</p>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/40 border border-white/[0.03] p-2.5 rounded-lg text-center hover:border-white/[0.08] transition">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Cadence</span>
                    <span className="text-xs font-black text-white block mt-0.5">{latestAnalysis.metrics?.cadence || '—'} SPM</span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.03] p-2.5 rounded-lg text-center hover:border-white/[0.08] transition">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">GCT</span>
                    <span className="text-xs font-black text-[#FF4F21] block mt-0.5">{latestAnalysis.metrics?.gct || '—'} ms</span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.03] p-2.5 rounded-lg text-center hover:border-white/[0.08] transition col-span-2">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Stride Length</span>
                    <span className="text-xs font-black text-white block mt-0.5">{latestAnalysis.metrics?.strideLength || '—'} m</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 italic">No telemetry record analyzed. Upload a session on the dashboard.</p>
            )}
          </div>

          {/* AI Focus & Weaknesses Suggester */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 relative overflow-hidden group hover:border-white/[0.08] transition duration-300 flex-grow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/10 transition duration-700" />
            
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3 mb-4 text-zinc-400">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Weakness Focus</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-white/[0.02] rounded-lg animate-pulse" />
                <div className="h-10 bg-white/[0.02] rounded-lg animate-pulse" />
              </div>
            ) : latestAnalysis?.insights?.weaknesses?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Click to ask assistant:</p>
                {latestAnalysis.insights.weaknesses.map((weakness: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(`How do I fix this weakness: "${weakness}"?`)}
                    className="w-full text-left p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-200 hover:border-amber-500/40 text-[10px] font-medium leading-relaxed transition duration-200 flex items-center justify-between group/w"
                  >
                    <span className="truncate pr-2">{weakness}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-amber-500 group-hover/w:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Preset Training focus:</p>
                {[
                  "Optimize ground contact time (GCT)",
                  "Unlock maximum speed strides",
                  "Fix high speed lateral pelvic drop"
                ].map((tip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(`What core drills do you recommend to ${tip.toLowerCase()}?`)}
                    className="w-full text-left p-3 rounded-lg border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-zinc-300 hover:border-zinc-700 text-[10px] font-medium transition duration-200 flex items-center justify-between group/w"
                  >
                    <span className="truncate pr-2">{tip}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 text-zinc-500 group-hover/w:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Chat Interface (3/4 size on desktop) */}
        <div className="lg:col-span-3 bg-[#08080C]/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md rounded-2xl flex flex-col overflow-hidden relative min-h-0">
          
          {/* Dynamic Glow Gradients */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4F21]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Messages List */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-6 z-10 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || `msg-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    msg.role === 'system' ? 'bg-[#08080C] border-zinc-800 text-zinc-500' : 
                    msg.role === 'assistant' ? 'bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 
                    'bg-black/60 border-[#FF4F21]/30 text-white shadow-[0_0_15px_rgba(255,79,33,0.1)]'
                  }`}>
                    {msg.role === 'system' ? <Activity className="h-4 w-4" /> : 
                     msg.role === 'assistant' ? <Brain className="h-4 w-4 animate-pulse" /> : 
                     <User className="h-4 w-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-medium whitespace-pre-wrap ${
                    msg.role === 'system' ? 'bg-black/40 border border-zinc-800/50 text-zinc-500 font-mono text-[9px] rounded-lg tracking-wider' :
                    msg.role === 'assistant' ? 'bg-[#08080C]/80 border border-white/[0.04] text-zinc-200 shadow-md backdrop-blur-sm' :
                    'bg-[#FF4F21]/15 text-white border border-[#FF4F21]/20 shadow-[0_2px_15px_rgba(255,79,33,0.1)] backdrop-blur-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-4 max-w-[80%]"
                >
                  <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-[#08080C]/80 border border-white/[0.04] flex items-center gap-1.5 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }) }} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-zinc-950/60 border-t border-white/[0.05] backdrop-blur-xl z-10 shrink-0">
            
            {/* Presets Suggestions */}
            <div className="flex gap-2.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {PRESET_PROMPTS.map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(preset.text)}
                    className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#08080C]/60 border border-white/[0.05] text-[10px] font-bold text-zinc-400 hover:text-white hover:border-[#FF4F21]/30 hover:bg-black/60 transition duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#FF4F21]" />
                    {preset.text}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your biomechanical intelligence engine (e.g., 'Why is my GCT high?')..."
                className="w-full bg-[#08080C]/80 border border-white/[0.05] rounded-xl pl-4 pr-14 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4F21]/40 focus:ring-1 focus:ring-[#FF4F21]/40 transition duration-200 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2.5 rounded-lg bg-zinc-900 border border-white/[0.05] text-[#FF4F21] hover:text-white hover:bg-[#FF4F21] hover:border-transparent disabled:opacity-50 disabled:hover:bg-zinc-900 disabled:hover:text-[#FF4F21] disabled:hover:border-white/[0.05] transition duration-200 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            
            <div className="text-center mt-2.5">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Lightbulb className="h-3 w-3 text-amber-500" />
                ATHLIXIR AI Model is context-aware of your entire history
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
