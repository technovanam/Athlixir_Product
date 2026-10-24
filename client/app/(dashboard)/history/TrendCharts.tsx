'use client';

import React from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Trophy, Gauge, Zap, Activity, LucideIcon } from 'lucide-react';

type Series = { date: string; value: number }[];

type EvolutionData = {
  performanceSeries: Series;
  cadenceSeries: Series;
  gctSeries: Series;
  symmetrySeries: Series;
};

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E2E8F0',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  fontSize: '12px',
  color: '#0F172A',
  fontWeight: 600,
  padding: '8px 12px',
};

const AXIS_STYLE = { fontSize: 10, fill: '#64748B', fontWeight: 600 };

function ChartCard({
  title,
  subtitle,
  children,
  accentColor,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 relative overflow-hidden transition-all duration-200">
      <div className="mb-4 flex items-start justify-between relative z-10">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Icon className="h-4 w-4" style={{ color: accentColor }} />
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="relative z-10" style={{ color: accentColor }}>{children}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function prepSeries(series: Series): { name: string; value: number }[] {
  return (series || []).map((s, i) => ({
    name: formatDate(s.date) || `S${i + 1}`,
    value: Math.round(s.value * 10) / 10,
  }));
}

export default function TrendCharts({ evolution }: { evolution: EvolutionData }) {
  const perfData = prepSeries(evolution?.performanceSeries || []);
  const cadData = prepSeries(evolution?.cadenceSeries || []);
  const gctData = prepSeries(evolution?.gctSeries || []);
  const symData = prepSeries(evolution?.symmetrySeries || []);

  if (perfData.length < 2) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Progression Trends</h2>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Performance Score Trend */}
        <ChartCard
          title="Performance Score"
          subtitle="Overall biomechanics score over sessions"
          accentColor="#FF4F21"
          icon={Trophy}
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4F21" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF4F21" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#FF4F21', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={65} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'State', fill: '#64748B', fontSize: 10 }} />
              <ReferenceLine y={88} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'Elite', fill: '#64748B', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF4F21"
                strokeWidth={2}
                fill="url(#perfGrad)"
                dot={{ fill: '#FF4F21', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#FF4F21', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cadence Trend */}
        <ChartCard
          title="Cadence"
          subtitle="Steps per minute — target 170–190 SPM"
          accentColor="#8B5CF6"
          icon={Gauge}
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={cadData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[140, 210]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={170} stroke="#10B981" strokeDasharray="3 3" label={{ value: '170', fill: '#10B981', fontSize: 10 }} />
              <ReferenceLine y={190} stroke="#10B981" strokeDasharray="3 3" label={{ value: '190', fill: '#10B981', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#8B5CF6', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* GCT Trend */}
        <ChartCard
          title="Ground Contact Time"
          subtitle="Milliseconds — lower is better, target 80–200ms"
          accentColor="#3B82F6"
          icon={Zap}
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={gctData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={200} stroke="#10B981" strokeDasharray="3 3" label={{ value: '200ms', fill: '#10B981', fontSize: 10 }} />
              <ReferenceLine y={240} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '240ms', fill: '#F59E0B', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Symmetry Trend */}
        <ChartCard
          title="Movement Symmetry"
          subtitle="Symmetry index — higher is better"
          accentColor="#10B981"
          icon={Activity}
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={symData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="symGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={85} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target', fill: '#10B981', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#symGrad)"
                dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#10B981', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

