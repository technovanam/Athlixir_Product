'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Sliders, Bell, LogOut, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'analysis' | 'security'>('account');

  return (
    <div className="flex-1 p-8 overflow-y-auto text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">Settings</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Manage your ATHLIXIR profile, analysis preferences, and security.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/[0.05] pb-px">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'account' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="h-4 w-4" /> Account
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'analysis' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sliders className="h-4 w-4" /> Analysis
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'security' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Profile Information</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Update your basic athlete details.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={user?.name || user?.username || ''} className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-zinc-900/20 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed" />
                  </div>
                </div>
                <button className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-md uppercase tracking-wider cursor-pointer">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Analysis Settings */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Biomechanics Preferences</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Customize how the AI evaluates your runs.</p>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Primary Event</label>
                  <select className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer">
                    <option className="bg-[#08080C] text-white">100m Sprint</option>
                    <option className="bg-[#08080C] text-white">200m Sprint</option>
                    <option className="bg-[#08080C] text-white">400m Sprint</option>
                    <option className="bg-[#08080C] text-white">Long Distance</option>
                  </select>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Measurement Units</label>
                  <select className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer">
                    <option className="bg-[#08080C] text-white">Metric (m, cm)</option>
                    <option className="bg-[#08080C] text-white">Imperial (ft, in)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.03] pt-6">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider"><Bell className="h-4 w-4 text-[#FF4F21]" /> AI Notifications</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Receive alerts when a new analysis is complete.</p>
                  </div>
                  <button className="h-6 w-10 rounded-full bg-[#FF4F21] relative transition-colors shadow-[0_0_10px_rgba(255,79,33,0.3)] cursor-pointer">
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Session Management</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Manage your active devices and connections.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Log Out</h4>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">End your current session.</p>
                    </div>
                  </div>
                  <button onClick={logout} className="px-4 py-2 border border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-xs font-bold transition duration-200 uppercase tracking-wider cursor-pointer">
                    Log out
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Delete Account</h4>
                      <p className="text-[10px] text-red-400/70 font-medium mt-0.5">Permanently delete your data and analyses.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition duration-200 uppercase tracking-wider cursor-pointer">
                    Delete Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
