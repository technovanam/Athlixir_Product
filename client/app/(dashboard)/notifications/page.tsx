'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Activity, Zap, ShieldAlert, Target, CheckCircle, Clock
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import { api } from '../../context/AuthContext';

export default function NotificationsPage() {
  const { dateRange } = useDateFilter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        
        // Compile notifications list
        const compiled: any[] = [];
        
        if (Array.isArray(list)) {
          list.forEach((analysis: any) => {
            const id = analysis.analysisId || analysis.id || '';
            const shortId = id.slice(0, 8);
            const timeStr = new Date(analysis.createdAt || analysis.updatedAt).toLocaleString();
            
            if (analysis.status === 'COMPLETED') {
              // 1. Completion event
              compiled.push({
                id: `${id}_completed`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'success',
                badge: 'Analysis Ready',
                title: `Sprint Analysis Ready (${shortId})`,
                description: `Your sprint session has completed processing. Cadence: ${analysis.metrics?.cadence || '—'} SPM, GCT: ${analysis.metrics?.gct || '—'} ms, Stride: ${analysis.metrics?.strideLength || '—'} m.`,
              });
              
              // 2. Asymmetry warning
              const symmetry = analysis.metrics?.symmetry;
              const asymmetry = analysis.metrics?.asymmetryIndex || (symmetry ? (100 - symmetry) : null);
              if (asymmetry && asymmetry > 8) {
                compiled.push({
                  id: `${id}_asymmetry`,
                  time: timeStr,
                  timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime() - 1000, // slight offset to order below completed
                  type: 'warning',
                  badge: 'Warning',
                  title: `Movement Asymmetry Detected (${shortId})`,
                  description: `AI pipeline detected a ${asymmetry.toFixed(1)}% asymmetry index. Focus on corrective exercises to balance load distribution.`,
                });
              }
              
              // 3. Flags warning
              if (analysis.metricFlags && analysis.metricFlags.length > 0) {
                compiled.push({
                  id: `${id}_flags`,
                  time: timeStr,
                  timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime() - 2000,
                  type: 'danger',
                  badge: 'Telemetry Alert',
                  title: `Performance Flags Raised (${shortId})`,
                  description: `The following flags were raised during analysis: ${analysis.metricFlags.join(', ')}.`,
                });
              }
            } else if (analysis.status === 'FAILED') {
              compiled.push({
                id: `${id}_failed`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'danger',
                badge: 'Analysis Failed',
                title: `Sprint Processing Failed (${shortId})`,
                description: analysis.errorMessage || 'The video format or resolution was insufficient for pose extraction. Please try uploading another clip.',
              });
            } else {
              // In progress
              compiled.push({
                id: `${id}_progress`,
                time: timeStr,
                timestamp: new Date(analysis.createdAt || analysis.updatedAt).getTime(),
                type: 'info',
                badge: 'Processing',
                title: `Sprint Analysis In Progress (${shortId})`,
                description: `Your uploaded video is running through the AI pipeline. Progress: ${analysis.progress ?? 0}%.`,
              });
            }
          });
        }
        
        // Sort by timestamp descending
        compiled.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(compiled);
      } catch (err) {
        console.error('Failed to compile notifications', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto w-full text-white">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Bell className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">System Activity</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Notifications</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Realtime telemetry and analysis alerts for {dateRange}</p>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Activity className="h-6 w-6 animate-spin text-[#FF4F21]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
          <Bell className="h-8 w-8 text-zinc-650 mx-auto mb-3" />
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">No Alerts Active</p>
          <p className="text-[10px] text-zinc-550 mt-1 max-w-xs mx-auto">Upload video footage to compile dynamic biomechanical alerts.</p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative border-l border-white/[0.05] ml-6 pl-8 space-y-12"
        >
          {notifications.map((notif) => {
            let icon = <Bell className="h-3 w-3 text-zinc-400" />;
            let styles = {
              glow: 'border-white/[0.05] bg-[#08080C]/40 hover:bg-[#08080C]/60 hover:border-white/[0.1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
              badge: 'text-zinc-400 bg-zinc-500/10',
              iconBg: 'bg-zinc-550/20 border-zinc-700',
              iconColor: 'text-zinc-500',
            };
            
            if (notif.type === 'success') {
              icon = <CheckCircle className="h-3 w-3 text-emerald-500" />;
              styles = {
                glow: 'border-white/[0.05] bg-[#08080C]/40 hover:bg-[#08080C]/60 hover:border-white/[0.1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
                badge: 'text-emerald-500 bg-emerald-500/10',
                iconBg: 'bg-emerald-500/20 border-emerald-500',
                iconColor: 'text-emerald-500',
              };
            } else if (notif.type === 'warning') {
              icon = <ShieldAlert className="h-3 w-3 text-amber-500" />;
              styles = {
                glow: 'border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/8 hover:border-amber-500/20',
                badge: 'text-amber-500 bg-amber-500/10',
                iconBg: 'bg-amber-500/20 border-amber-500',
                iconColor: 'text-amber-500',
              };
            } else if (notif.type === 'danger') {
              icon = <ShieldAlert className="h-3 w-3 text-red-500" />;
              styles = {
                glow: 'border-red-500/10 bg-red-500/5 hover:bg-red-500/8 hover:border-red-500/20',
                badge: 'text-red-500 bg-red-500/10',
                iconBg: 'bg-red-500/20 border-red-500',
                iconColor: 'text-red-500',
              };
            } else if (notif.type === 'info') {
              icon = <Activity className="h-3 w-3 text-blue-400" />;
              styles = {
                glow: 'border-white/[0.05] bg-[#08080C]/40 hover:bg-[#08080C]/60 hover:border-white/[0.1] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
                badge: 'text-blue-400 bg-blue-500/10',
                iconBg: 'bg-blue-500/20 border-blue-500',
                iconColor: 'text-blue-500',
              };
            }
            
            return (
              <motion.div key={notif.id} variants={itemVariants} className="relative group">
                <div className={`absolute -left-[45px] top-1 h-6 w-6 rounded-full border flex items-center justify-center ring-4 ring-[#08080C] ${styles.iconBg}`}>
                  {icon}
                </div>
                <div className={`border backdrop-blur-md rounded-xl p-6 transition-all duration-300 ${styles.glow}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {notif.time}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${styles.badge}`}>
                      {notif.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{notif.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{notif.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
