'use client';

import React from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type Series = { date: string; value: number }[];

type EvolutionData = {
  performanceSeries: Series;
  cadenceSeries: Series;
  gctSeries: Series;
  symmetrySeries: Series;
};

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '10px',
  fontSize: '11px',
  color: '#e4e4e7',
};

const AXIS_STYLE = { fontSize: 10, fill: '#52525b', fontWeight: 600 };

function ChartCard({
  title,
  subtitle,
  children,
  accentColor,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">{title}</h3>
        <p className="text-[10px] text-zinc-600 mt-0.5">{subtitle}</p>
      </div>
      <div style={{ color: accentColor }}>{children}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function prepSeries(series: Series): { name: string; value: number }[] {
  return series.map((s, i) => ({
    name: formatDate(s.date) || `S${i + 1}`,
    value: Math.round(s.value * 10) / 10,
  }));
}

export default function TrendCharts({ evolution }: { evolution: EvolutionData }) {
  const perfData = prepSeries(evolution.performanceSeries);
  const cadData = prepSeries(evolution.cadenceSeries);
  const gctData = prepSeries(evolution.gctSeries);
  const symData = prepSeries(evolution.symmetrySeries);

  if (perfData.length < 2) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Progression Trends</h2>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Performance Score Trend */}
        <ChartCard
          title="Performance Score"
          subtitle="Overall biomechanics score over sessions"
          accentColor="#FF4F21"
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={perfData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4F21" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF4F21" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#FF4F21', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={65} stroke="#52525b" strokeDasharray="3 3" label={{ value: 'State', fill: '#52525b', fontSize: 9 }} />
              <ReferenceLine y={88} stroke="#52525b" strokeDasharray="3 3" label={{ value: 'Elite', fill: '#52525b', fontSize: 9 }} />
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
          accentColor="#a78bfa"
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={cadData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[140, 210]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={170} stroke="#34d399" strokeDasharray="3 3" label={{ value: '170', fill: '#34d399', fontSize: 9 }} />
              <ReferenceLine y={190} stroke="#34d399" strokeDasharray="3 3" label={{ value: '190', fill: '#34d399', fontSize: 9 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* GCT Trend */}
        <ChartCard
          title="Ground Contact Time"
          subtitle="Milliseconds — lower is better, target 80–200ms"
          accentColor="#60a5fa"
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={gctData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#60a5fa', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={200} stroke="#34d399" strokeDasharray="3 3" label={{ value: '200ms', fill: '#34d399', fontSize: 9 }} />
              <ReferenceLine y={240} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: '240ms', fill: '#fbbf24', fontSize: 9 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Symmetry Trend */}
        <ChartCard
          title="Movement Symmetry"
          subtitle="Symmetry index — higher is better"
          accentColor="#34d399"
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={symData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="symGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#34d399', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={85} stroke="#34d399" strokeDasharray="3 3" label={{ value: 'Target', fill: '#34d399', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#symGrad)"
                dot={{ fill: '#34d399', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#34d399', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
