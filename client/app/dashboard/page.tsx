'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, Settings, FolderKanban, ShieldCheck, Activity, Users, PlusCircle, CheckCircle, RefreshCcw } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-violet-500/30">
      
      {/* SIDEBAR SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-violet-500/25">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-sm text-white leading-tight">ATHLIXIR</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Workspace Enterprise</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'workspace', label: 'Workspace Info', icon: FolderKanban },
              { id: 'account', label: 'Account Profile', icon: User },
              { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30 border border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User context footer */}
        <div className="border-t border-zinc-800/80 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-violet-400 uppercase border border-zinc-700">
              {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{user?.username}</span>
              <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 transition duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* DASHBOARD CONTENT DASHBOARD */}
      <main className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Background Neon Blurs */}
        <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none"></div>
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Enterprise Dashboard
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Gateway security session is healthy and active.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Profile</span>
          </button>
        </div>

        {/* TAB RENDERING */}
        <div className="relative z-10 space-y-8">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header card with welcome */}
              <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-black p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-violet-600/10 to-transparent blur-3xl pointer-events-none"></div>
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4 border border-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Firebase Auth & Session Verified</span>
                  </span>
                  <h2 className="text-2xl font-bold text-white md:text-3xl">
                    Hello, {user?.username || 'Teammate'}!
                  </h2>
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                    All transactions, profile states, and authentication requests are validated inside our secure NestJS backplane. Client credentials never leak directly to the Firebase database layers.
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Authorized Role</span>
                    <User className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="block text-2xl font-extrabold text-white mt-4 capitalize">
                    {user?.role || 'User'}
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Workspace Size</span>
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="block text-2xl font-extrabold text-white mt-4">
                    {user?.workspace?.workspaceSize || 1} Members
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Onboarding State</span>
                    <Activity className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="block text-2xl font-extrabold text-emerald-400 mt-4 flex items-center gap-1.5">
                    <span>Active Suite</span>
                  </span>
                </div>
              </div>

              {/* Selected focus industries card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Focus Specialties</h3>
                  <p className="text-xs text-zinc-500 mt-1">Your registered areas of operational analysis</p>
                </div>

                {user?.workspace?.industries && user.workspace.industries.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.workspace.industries.map((ind, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs font-semibold text-zinc-300"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No industries selected.</p>
                )}
              </div>

            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white">Workspace Configuration</h3>
                <p className="text-sm text-zinc-400 mt-1">Details fetched live from Firestore document profile.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Team Name</span>
                  <span className="block text-base font-bold text-white">{user?.workspace?.workspaceName || 'Unassigned'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Your Role inside Workspace</span>
                  <span className="block text-base font-bold text-white capitalize">{user?.workspace?.roleInWorkspace || 'Unassigned'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Database UID reference</span>
                  <span className="block text-xs font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800 select-all overflow-x-auto">
                    {user?.uid}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white">Account Details</h3>
                <p className="text-sm text-zinc-400 mt-1">Registered profile credentials on Firestore.</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Username</span>
                  <span className="block text-base font-semibold text-white">{user?.username}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Primary Email</span>
                  <span className="block text-base font-semibold text-white">{user?.email}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Account Status</span>
                  <span className="block text-sm font-semibold text-emerald-400 capitalize">{user?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white">Security Architecture Summary</h3>
                <p className="text-sm text-zinc-400 mt-1">Gateway configurations for high compliance setups.</p>
              </div>

              <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    <span className="font-semibold text-white">No Direct Client SDK:</span> The React Next.js application contains zero initialization keys, configurations, or operations direct to Google Firebase services.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    <span className="font-semibold text-white">HttpOnly Session Cookies:</span> Web credentials are tied to secure, site-scoped cookies managed by the NestJS authentication guard falling back to authorization headers for sandbox APIs.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
