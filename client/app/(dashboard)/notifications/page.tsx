'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell, Activity, ShieldAlert, CheckCircle, Clock, ArrowLeft,
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import { api } from '../../context/AuthContext';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

export default function NotificationsPage() {
  const router = useRouter();
  const { dateRange } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
        const list = res.data?.data ?? res.data ?? [];

        const compiled: any[] = [];

        if (Array.isArray(list)) {
          list.forEach((analysis: any) => {
            const id = analysis.analysisId || analysis.id || '';
            const shortId = id.slice(0, 8);
            const timeStr = new Date(analysis.createdAt || analysis.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            if (analysis.status === 'COMPLETED') {
              compiled.push({
                id: `${id}_completed`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'success',
                badge: 'Analysis Complete',
                title: `Sprint Telemetry Ready #${shortId}`,
                description: `Your sprint kinematic report is finalized. Cadence: ${analysis.metrics?.cadence || '—'} SPM, GCT: ${analysis.metrics?.gct || '—'} ms, Stride: ${analysis.metrics?.strideLength || '—'} m.`,
              });

              const symmetry = analysis.metrics?.symmetry;
              const asymmetry = analysis.metrics?.asymmetryIndex || (symmetry ? (100 - symmetry) : null);
              if (asymmetry && asymmetry > 8) {
                compiled.push({
                  id: `${id}_asymmetry`,
                  time: timeStr,
                  timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime() - 1000,
                  type: 'warning',
                  badge: 'Gait Asymmetry',
                  title: `Asymmetry Calibration Alert #${shortId}`,
                  description: `Vision AI detected a ${asymmetry.toFixed(1)}% asymmetry index. Review recommendations to optimize force transfer.`,
                });
              }

              if (analysis.metricFlags && analysis.metricFlags.length > 0) {
                compiled.push({
                  id: `${id}_flags`,
                  time: timeStr,
                  timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime() - 2000,
                  type: 'danger',
                  badge: 'Kinematic Alert',
                  title: `Technique Flags Identified #${shortId}`,
                  description: `Flags raised: ${analysis.metricFlags.join(', ')}. Check the intelligence hub for corrective cues.`,
                });
              }
            } else if (analysis.status === 'FAILED') {
              compiled.push({
                id: `${id}_failed`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'danger',
                badge: 'Failed Upload',
                title: `Processing Error #${shortId}`,
                description: analysis.errorMessage || 'Video resolution was insufficient for automated keypoint extraction.',
              });
            } else {
              compiled.push({
                id: `${id}_progress`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'info',
                badge: 'AI Processing',
                title: `Computing Biomechanics #${shortId}`,
                description: `Neural model running frame-by-frame pose estimation (${analysis.progress ?? 0}% completed).`,
              });
            }
          });
        }

        compiled.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(compiled);
    } catch (err) {
      console.error('Failed to compile notifications', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  const STYLE_MAP: Record<string, { icon: React.ReactNode; badge: string; iconBg: string }> = {
    success: { icon: <CheckCircle size={18} className="text-emerald-600" />, badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60', iconBg: 'bg-emerald-50' },
    warning: { icon: <ShieldAlert size={18} className="text-amber-600" />, badge: 'text-amber-700 bg-amber-50 border border-amber-200/60', iconBg: 'bg-amber-50' },
    danger: { icon: <ShieldAlert size={18} className="text-[#FF4F21]" />, badge: 'text-[#FF4F21] bg-[#FFF2EE] border border-[#FFE0D6]', iconBg: 'bg-[#FFF2EE]' },
    info: { icon: <Activity size={18} className="text-blue-600" />, badge: 'text-blue-700 bg-blue-50 border border-blue-200/60', iconBg: 'bg-blue-50' },
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · SYSTEM & TELEMETRY ALERTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Notifications <Bell size={24} className="text-[#FF4F21]" />
          </h1>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Activity className="h-7 w-7 animate-spin text-[#FF4F21]" />
          </div>
        ) : fetchError ? (
          <DataFetchError error={fetchError} onRetry={loadNotifications} />
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[28px] border border-black/[0.06] shadow-xs p-8">
            <div className="h-14 w-14 rounded-2xl bg-[#FFF5F2] flex items-center justify-center mx-auto mb-3 text-[#FF4F21]">
              <Bell size={28} />
            </div>
            <p className="font-black text-base text-[#1C1C1E]">
              No alerts yet
            </p>
            <p className="text-xs text-[#8E8E93] font-medium mt-1">
              Upload sprint footage on the dashboard to generate kinematics diagnostics and performance cues.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3.5"
          >
            {notifications.map((notif) => {
              const style = STYLE_MAP[notif.type] || STYLE_MAP.info;
              return (
                <motion.div
                  key={notif.id}
                  variants={itemVariants}
                  className="flex gap-4 p-5 sm:p-6 bg-white rounded-[28px] border border-black/[0.06] shadow-xs hover:border-[#FF4F21]/30 transition"
                >
                  <div className={`h-11 w-11 rounded-2xl ${style.iconBg} flex items-center justify-center shrink-0`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
                        {notif.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-[#8E8E93] flex items-center gap-1">
                        <Clock size={12} /> {notif.time}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-[#1C1C1E]">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#636366] font-medium mt-1 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
