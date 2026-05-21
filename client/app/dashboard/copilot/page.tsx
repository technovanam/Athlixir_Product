'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Activity, User, ShieldAlert, Sparkles, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CopilotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', content: 'ATHLIXIR AI Copilot initialized. Analyzing your recent biomechanics data...' },
    { id: 2, role: 'assistant', content: 'Hello! I am your AI Athlete Assistant. Based on your last 3 sprint sessions, I noticed your Ground Contact Time (GCT) is slightly high at 210ms. How can I help you optimize your training today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const athleteName = user?.name || user?.username || 'Athlete';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      let aiResponse = 'I am analyzing your biomechanical markers...';
      
      if (input.toLowerCase().includes('cadence')) {
        aiResponse = 'Your average cadence is 172 SPM. To reach the elite benchmark of 185 SPM, you should incorporate wicket runs into your acceleration days. This forces your body to adapt to rapid turnover without overstriding.';
      } else if (input.toLowerCase().includes('hamstring') || input.toLowerCase().includes('injury')) {
        aiResponse = 'I noticed a 11.4% asymmetry putting stress on your left hamstring. This is likely caused by excessive forward posture lean during deceleration. I recommend adding isometric hip flexor holds to your routine.';
      } else if (input.toLowerCase().includes('compare')) {
        aiResponse = 'Compared to State-level athletes, your sprint efficiency is in the top 18%, but your posture mechanics (specifically hip drop) are in the bottom 40%. Fixing hip stability will unlock significant top-end speed.';
      }

      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const PRESET_PROMPTS = [
    "Why is my cadence low?",
    "How do I improve acceleration?",
    "Compare me with elite sprinters."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full p-4 md:p-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8 shrink-0"
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">AI Copilot</h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Context-Aware Biomechanics Assistant</p>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide z-10">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === 'system' ? 'bg-zinc-800 text-zinc-500' : 
                  msg.role === 'assistant' ? 'bg-gradient-to-tr from-purple-500 to-blue-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 
                  'bg-zinc-800 text-white'
                }`}>
                  {msg.role === 'system' ? <Activity className="h-4 w-4" /> : 
                   msg.role === 'assistant' ? <Sparkles className="h-4 w-4" /> : 
                   <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'system' ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-xs' :
                  msg.role === 'assistant' ? 'bg-zinc-900 border border-zinc-800 text-zinc-200' :
                  'bg-[#FF4F21] text-white'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 max-w-[80%]"
              >
                <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 backdrop-blur-xl z-10">
          
          {/* Presets */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setInput(preset)}
                className="whitespace-nowrap px-4 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                {preset}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI coach about your mechanics..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-lg bg-zinc-800 text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-zinc-800 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">ATHLIXIR AI Model is context-aware of your entire history</span>
          </div>
        </div>

      </div>
    </div>
  );
}
