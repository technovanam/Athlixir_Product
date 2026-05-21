'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../context/AuthContext';
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, 
  Settings2, Activity, Target, Download, Share2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import InsightsWidget from '../../components/InsightsWidget';
import BenchmarkWidget from '../../components/BenchmarkWidget';

export default function AnalysisDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Video Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        setAnalysis(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load analysis', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  // Sync videos
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (overlayRef.current && Math.abs(overlayRef.current.currentTime - videoRef.current.currentTime) > 0.1) {
        overlayRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        overlayRef.current?.pause();
      } else {
        videoRef.current.play();
        overlayRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    if (overlayRef.current) overlayRef.current.playbackRate = rate;
  };

  const stepFrame = (forward: boolean) => {
    if (videoRef.current) {
      videoRef.current.pause();
      overlayRef.current?.pause();
      setIsPlaying(false);
      // Assume 30fps = ~0.033s per frame
      const step = forward ? 0.033 : -0.033;
      videoRef.current.currentTime += step;
      if (overlayRef.current) overlayRef.current.currentTime += step;
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (overlayRef.current) overlayRef.current.currentTime = time;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin text-[#FF4F21]"><Activity /></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-zinc-500">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2>Analysis not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FF4F21] hover:underline">Go Back</button>
      </div>
    );
  }

  const metrics = analysis.metrics || {};
  const scores = analysis.scores || {};
  const insights = analysis.insights || {};
  const injury = analysis.injuryRisk || { level: 'LOW' };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8 animate-fadeIn pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Analysis Details</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{new Date(analysis.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-sm font-bold text-white transition flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#FF4F21] hover:bg-[#FF8433] text-sm font-bold text-white transition flex items-center gap-2 shadow-[0_0_15px_rgba(255,79,33,0.3)]">
            <Download className="h-4 w-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Video Player (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* F1 Telemetry Video Player */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden relative shadow-2xl">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-black/60 backdrop-blur border border-zinc-700 px-3 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> RAW
              </span>
              {analysis.overlayVideoUrl && (
                <span className="bg-blue-500/20 backdrop-blur border border-blue-500/50 px-3 py-1 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3" /> TRACKING
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 bg-black aspect-video relative group">
              {/* RAW Video */}
              <div className="relative border-r border-zinc-800">
                <video 
                  ref={videoRef}
                  src={analysis.videoUrl} 
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
              {/* Overlay Video */}
              <div className="relative">
                {analysis.overlayVideoUrl ? (
                  <video 
                    ref={overlayRef}
                    src={analysis.overlayVideoUrl} 
                    className="w-full h-full object-contain"
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
                    <Settings2 className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Processing Overlay...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Custom Controls */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
              {/* Scrubber */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-zinc-400 w-12 text-right">{currentTime.toFixed(2)}s</span>
                <input 
                  type="range" 
                  min={0} 
                  max={duration} 
                  step="0.01" 
                  value={currentTime} 
                  onChange={seek}
                  className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
                />
                <span className="text-xs font-mono text-zinc-400 w-12">{duration.toFixed(2)}s</span>
              </div>
              
              {/* Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => stepFrame(false)} className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center border border-zinc-800 transition">
                    <SkipBack className="h-4 w-4 text-zinc-400" />
                  </button>
                  <button onClick={togglePlay} className="h-10 w-10 rounded-full bg-[#FF4F21] hover:bg-[#FF8433] flex items-center justify-center shadow-[0_0_15px_rgba(255,79,33,0.3)] transition">
                    {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-1" />}
                  </button>
                  <button onClick={() => stepFrame(true)} className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center border border-zinc-800 transition">
                    <SkipForward className="h-4 w-4 text-zinc-400" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                  {[1, 0.5, 0.25].map(rate => (
                    <button 
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition ${playbackRate === rate ? 'bg-[#FF4F21] text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Frame-by-Frame Timeline Highlights */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="h-3 w-3" /> Biomechanical Events Timeline
            </h3>
            <div className="relative pl-6 border-l-2 border-zinc-800 space-y-4">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-blue-500 border-[3px] border-zinc-950" />
                <div className="flex gap-4 items-start">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-12 mt-0.5">0.24s</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Toe-off Phase</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Excellent ankle extension achieved.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-amber-500 border-[3px] border-zinc-950" />
                <div className="flex gap-4 items-start">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-12 mt-0.5">0.51s</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Max Knee Drive</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Knee angle is 72° (Optimal range is 75-85°). Slightly restricted.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-red-500 border-[3px] border-zinc-950" />
                <div className="flex gap-4 items-start">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-12 mt-0.5">0.83s</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Foot Strike</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">Overstride detected. Landing ahead of center of mass.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Deep Metrics & Intelligence */}
        <div className="space-y-6">
          
          {/* Running Metrics */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h3 className="text-[10px] font-bold text-[#FF4F21] uppercase tracking-widest mb-4">Running Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Cadence</div>
                <div className="text-lg font-black text-white">{metrics.cadence || '—'} <span className="text-[10px] font-normal text-zinc-500">spm</span></div>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">GCT</div>
                <div className="text-lg font-black text-white">{metrics.gct || '—'} <span className="text-[10px] font-normal text-zinc-500">ms</span></div>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Stride Length</div>
                <div className="text-lg font-black text-white">{metrics.strideLength || '—'} <span className="text-[10px] font-normal text-zinc-500">m</span></div>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Symmetry</div>
                <div className="text-lg font-black text-emerald-400">92<span className="text-[10px] font-normal text-zinc-500">%</span></div>
              </div>
            </div>
          </div>

          {/* Biomechanical Quality */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Biomechanical Form</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  <span>Knee Drive</span>
                  <span className="text-amber-400">Restricted</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[65%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  <span>Posture Angle</span>
                  <span className="text-emerald-400">Optimal</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  <span>Foot Strike</span>
                  <span className="text-red-500">Heel Heavy</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[45%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Benchmark Integration */}
          <BenchmarkWidget analysis={analysis} />

        </div>
      </div>

      {/* Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <InsightsWidget analysis={analysis} />
        
        {/* Recommendations Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-[#FF4F21]" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Targeted Recommendations</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black border border-zinc-800">
              <h4 className="text-xs font-bold text-white mb-2">Fix Overstride</h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Your foot is landing too far ahead of your center of mass. Incorporate **A-Skips** and **High Knees** into your warmup to promote a mid-foot strike directly under the hips.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black border border-zinc-800">
              <h4 className="text-xs font-bold text-white mb-2">Improve Cadence</h4>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Current cadence is below the State benchmark. Try running with a metronome set to 180bpm to naturally shorten your stride and increase turnover rate.
              </p>
            </div>
          </div>
          <button className="w-full mt-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-xs font-bold text-white transition">
            View Full Training Plan
          </button>
        </div>
      </div>

    </div>
  );
}
