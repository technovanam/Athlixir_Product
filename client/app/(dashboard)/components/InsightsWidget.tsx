'use client';

import React from 'react';
import { 
  Lightbulb, AlertTriangle, CheckCircle2, 
  Activity, Target, Timer, Compass, Shield
} from 'lucide-react';

function getInsightText(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'object') {
    return (
      item.observation ||
      item.insight ||
      item.text ||
      item.title ||
      item.message ||
      item.description ||
      item.drill ||
      Object.values(item)
        .filter((v) => typeof v === 'string')
        .join(' — ') ||
      ''
    );
  }
  return String(item);
}

export default function InsightsWidget({ analysis }: { analysis: any }) {
  const hasData = analysis && (analysis.metrics || analysis.insights || analysis.aiInsights);
  
  const metrics = hasData ? (analysis.metrics || {}) : {};
  const scores = hasData ? (analysis.scores || {}) : {};
  
  const cadence: number | null = typeof metrics.cadence === 'number' ? metrics.cadence : null;
  const gct: number | null = typeof metrics.gct === 'number' ? metrics.gct : null;
  const strideLength: number | null = typeof metrics.strideLength === 'number' ? metrics.strideLength : null;
  const symmetry: number | null = typeof metrics.symmetry === 'number' ? metrics.symmetry : null;

  const activeInsights = hasData ? (analysis.aiInsights || analysis.insights || {}) : {};
  const strengths: any[] = activeInsights.strengths?.length ? activeInsights.strengths : [];
  const weaknesses: any[] = activeInsights.weaknesses?.length ? activeInsights.weaknesses : [];
  const observations: any[] = activeInsights.observations || [];

  // Interpretive commentary is only generated from real measured values.
  const interpretations: string[] = [];
  if (cadence !== null) {
    interpretations.push(
      cadence >= 180
        ? 'High turnover frequency supports rapid force transfer.'
        : 'Stride turnover is accelerating towards optimal 180 SPM target.'
    );
  }
  if (symmetry !== null) {
    interpretations.push(
      symmetry >= 95
        ? 'Kinetic symmetry is well balanced between left and right limb loading.'
        : 'Minor unilateral load discrepancy detected — monitor kinetic balance.'
    );
  }

  const displayObservations = [...interpretations, ...observations];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#FFF2EE] flex items-center justify-center text-[#FF4F21]">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Biomechanical Diagnostics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kinetic telemetry and form breakdown
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Telemetry Ready
        </span>
      </div>

      {/* Metric Tiles (Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Timer size={13} className="text-blue-500" /> Ground Contact
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">{gct ?? '—'} <span className="text-xs font-normal text-slate-500">ms</span></div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Activity size={13} className="text-[#FF4F21]" /> Cadence
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">{cadence ?? '—'} <span className="text-xs font-normal text-slate-500">SPM</span></div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Compass size={13} className="text-emerald-500" /> Stride Length
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">{strideLength ?? '—'} <span className="text-xs font-normal text-slate-500">m</span></div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Target size={13} className="text-purple-500" /> Symmetry
          </span>
          <div className="text-lg font-bold text-slate-900 mt-1">{symmetry !== null ? `${symmetry}%` : '—'}</div>
        </div>
      </div>

      {/* Observations & Form Strengths/Weaknesses */}
      {strengths.length === 0 && weaknesses.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium">
          AI-identified strengths and focus areas aren&apos;t available for this analysis yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100/80">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Observed Strengths</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-800">
                {strengths.map((s: any, idx: number) => {
                  const text = getInsightText(s);
                  if (!text) return null;
                  return (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Focus Areas */}
          {weaknesses.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100/80">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Calibration Focus</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-800">
                {weaknesses.map((w: any, idx: number) => {
                  const text = getInsightText(w);
                  if (!text) return null;
                  return (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
