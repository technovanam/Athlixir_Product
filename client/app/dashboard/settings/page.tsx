'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Sliders, Bell, LogOut, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'analysis' | 'security'>('account');

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Settings</h1>
          <p className="text-zinc-400 text-sm">Manage your ATHLIXIR profile, analysis preferences, and security.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-zinc-800 pb-px">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'account' ? 'border-[#FF4F21] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="h-4 w-4" /> Account
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'analysis' ? 'border-[#FF4F21] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sliders className="h-4 w-4" /> Analysis
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'security' ? 'border-[#FF4F21] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Profile Information</h3>
                  <p className="text-xs text-zinc-500 mb-4">Update your basic athlete details.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                    <input type="text" defaultValue={user?.name || user?.username || ''} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4F21] transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                    <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-500 cursor-not-allowed" />
                  </div>
                </div>
                <button className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Analysis Settings */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Biomechanics Preferences</h3>
                  <p className="text-xs text-zinc-500 mb-4">Customize how the AI evaluates your runs.</p>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Primary Event</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4F21] transition appearance-none">
                    <option>100m Sprint</option>
                    <option>200m Sprint</option>
                    <option>400m Sprint</option>
                    <option>Long Distance</option>
                  </select>
                </div>
                <div className="space-y-2 max-w-md">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Measurement Units</label>
                  <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF4F21] transition appearance-none">
                    <option>Metric (m, cm)</option>
                    <option>Imperial (ft, in)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-6">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><Bell className="h-4 w-4" /> AI Notifications</h4>
                    <p className="text-xs text-zinc-500">Receive alerts when a new analysis is complete.</p>
                  </div>
                  <button className="h-6 w-10 rounded-full bg-[#FF4F21] relative transition-colors">
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Session Management</h3>
                  <p className="text-xs text-zinc-500">Manage your active devices and connections.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Log Out</h4>
                      <p className="text-xs text-zinc-500">End your current session.</p>
                    </div>
                  </div>
                  <button onClick={logout} className="px-4 py-2 border border-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-800 transition">
                    Log out
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400">Delete Account</h4>
                      <p className="text-xs text-red-400/70">Permanently delete your data and analyses.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">
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
