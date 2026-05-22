'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ProgressWidget() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        if (Array.isArray(list)) {
          const completed = list.filter((a: any) => a.status === 'COMPLETED');
          completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          const chartData = completed.map((c: any, i: number) => ({
            name: `S${i+1}`,
            score: c.scores?.performanceScore || 0,
            cadence: c.metrics?.cadence || 0,
          }));
          setData(chartData.slice(-10)); // Last 10 sessions
        }
      } catch (err) {
        console.error('Failed to load progress', err);
      }
    };
    fetchHistory();
  }, []);

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
        <TrendingUp className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Need more sessions to show trends</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col h-full hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Performance Trend</h3>
        </div>
        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Last {data.length} Scans</span>
      </div>

      <div className="flex-1 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              name="Perf Score"
              stroke="#FF4F21" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#FF4F21', strokeWidth: 0 }} 
              activeDot={{ r: 6, fill: '#fff' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
