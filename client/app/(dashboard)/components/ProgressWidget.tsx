'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ProgressWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        if (Array.isArray(list)) {
          const completed = list.filter((a: any) => a.status === 'COMPLETED');
          completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          // Previously this synthesized a fake increasing trend (85 + i*2,
          // 175 + i) for any session missing a real performanceScore, and
          // fell back to an entirely fabricated 4-point chart ([82,84,87,89])
          // when fewer than 2 real sessions existed. Now: only sessions with
          // a real performanceScore are plotted; nothing is invented.
          const chartData = completed
            .filter((c: any) => typeof c.scores?.performanceScore === 'number')
            .map((c: any, i: number) => ({
              name: `Run ${i + 1}`,
              score: c.scores.performanceScore,
              cadence: typeof c.metrics?.cadence === 'number' ? c.metrics.cadence : undefined,
            }));
          setData(chartData.slice(-10));
        }
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[#FF4F21]" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Performance Evolution</h3>
        </div>
        {data.length >= 2 && (
          <span className="text-[11px] text-slate-500 font-semibold">Last {data.length} Sessions</span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 h-36 flex items-center justify-center">
          <span className="text-xs text-slate-400 font-medium">Loading…</span>
        </div>
      ) : data.length >= 2 ? (
        <div className="flex-1 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                itemStyle={{ color: '#0F172A', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Form Score"
                stroke="#FF4F21"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#FF4F21', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#FF4F21' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 h-36 flex items-center justify-center text-center px-4">
          <p className="text-xs text-slate-400 font-medium">
            {data.length === 0
              ? 'No progress data yet. Complete a sprint analysis to get started.'
              : 'Complete another session to see your performance trend.'}
          </p>
        </div>
      )}
    </div>
  );
}
