'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Compass, Users, Check, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

const ROLES = [
  { id: 'coach', label: 'Head Coach / Trainer', desc: 'Directs training plans and sessions' },
  { id: 'athlete', label: 'Professional Athlete', desc: 'Tracks fitness and targets key metrics' },
  { id: 'medical', label: 'Medical Staff / Physio', desc: 'Monitors injuries and rehabilitation' },
  { id: 'analyst', label: 'Data Analyst / Scout', desc: 'Drives performance modeling insights' },
];

const INDUSTRIES = [
  'Strength & Conditioning',
  'Nutrition & Dietetics',
  'Sports Medicine & Injury Rehab',
  'Wearable Performance Tracking',
  'Biomechanical Analysis',
  'Tactical Skill Development',
];

export default function OnboardingPage() {
  const { onboard, error, user } = useAuth();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const [roleInWorkspace, setRoleInWorkspace] = useState('');
  const [workspaceSize, setWorkspaceSize] = useState(5);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  const handleNextStep = () => {
    setStepError(null);
    if (step === 1) {
      if (!workspaceName.trim()) {
        setStepError('Please specify a workspace or team name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!roleInWorkspace) {
        setStepError('Please select your primary role.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStepError(null);
    try {
      await onboard({
        workspaceName,
        roleInWorkspace,
        workspaceSize,
        industries: selectedIndustries,
      });
    } catch (err: any) {
      setStepError(err.message || 'Onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-violet-500/30">
      {/* Background Blurs */}
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]"></div>
      <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[120px]"></div>

      {/* Header bar */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/20 px-8 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <span className="font-bold tracking-wider text-sm uppercase text-zinc-300">Athlixir Suite</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">Logged in:</span> {user?.email}
          </div>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          
          {/* Progress Indicators */}
          <div className="mb-12 flex justify-between items-center max-w-md mx-auto relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
            <div
              className="absolute left-0 top-1/2 h-0.5 bg-violet-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>

            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border font-semibold text-sm transition-all duration-300 ${
                  num < step
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : num === step
                    ? 'border-violet-400 bg-black text-violet-400 ring-4 ring-violet-500/20'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Cards wrapper */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12 backdrop-blur-2xl shadow-2xl">
            
            {/* Step Errors */}
            {(error || stepError) && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{stepError || error}</span>
              </div>
            )}

            {/* STEP 1: WORKSPACE NAME */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    Create your workspace
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Athlixir organizes your teammates, data streams, and scheduling profiles within a shared workspace container.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="workspace" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Workspace or Team Name
                    </label>
                    <input
                      type="text"
                      id="workspace"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Apex Performance Lab"
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3.5 text-base text-white placeholder-zinc-500 outline-none transition duration-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ROLE & SIZE */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    Tell us about your role
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Select your primary functional title to optimize the layout of tools and shortcuts.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoleInWorkspace(r.id)}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition duration-200 outline-none cursor-pointer ${
                        roleInWorkspace === r.id
                          ? 'border-violet-500 bg-violet-600/10 ring-1 ring-violet-500'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/30'
                      }`}
                    >
                      <span className="font-semibold text-sm text-white">{r.label}</span>
                      <span className="text-xs text-zinc-400 mt-1">{r.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Team size slider */}
                <div className="border-t border-zinc-800/80 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Team / Member Size</span>
                    <span className="text-sm font-bold text-violet-400">{workspaceSize} members</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={workspaceSize}
                    onChange={(e) => setWorkspaceSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>1 Member</span>
                    <span>25 Members</span>
                    <span>50+ Members</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: INDUSTRIES */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    Focus Focus Areas
                  </h2>
                  <p className="text-sm text-zinc-400 mt-2">
                    Choose matching fields of interest to let our analytical dashboard initialize with customized metric reports.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {INDUSTRIES.map((ind) => {
                    const isSelected = selectedIndustries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleIndustry(ind)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold transition duration-200 outline-none cursor-pointer ${
                          isSelected
                            ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 text-zinc-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        <span>{ind}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="mt-12 flex justify-between items-center border-t border-zinc-800/80 pt-6">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition duration-200 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition duration-200 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initializing Suite...</span>
                      </>
                    ) : (
                      <>
                        <span>Finish Onboarding</span>
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
