'use client';

import React from 'react';

const SKETCHFAB_EMBED_URL =
  'https://sketchfab.com/models/9bfa112a99844626ac2480fff6276f0e/embed?autostart=1&preload=1&transparent=1&ui_infos=0&ui_watermark=0&ui_theme=dark&ui_controls=0&ui_stop=0&ui_inspector=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_help=0&ui_hint=0&ui_ar=0';

const SKETCHFAB_RUNNER_URL =
  'https://sketchfab.com/models/9bfa112a99844626ac2480fff6276f0e/embed?autostart=1&preload=1&transparent=1&ui_infos=0&ui_watermark=0&ui_theme=dark&ui_controls=0&ui_stop=0&ui_inspector=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_help=0&ui_hint=0&ui_ar=0&camera=0';

type Biomech3DCanvasProps = {
  mode?: 'anatomy' | 'runner';
};

function RunningAthleteModel() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <iframe
        title="Ecorche Anatomy Human Male Musculature"
        src={SKETCHFAB_RUNNER_URL}
        className="absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 border-0 bg-black opacity-75 [filter:brightness(0.76)_contrast(1.22)_saturate(1.08)]"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.72)_73%),linear-gradient(to_bottom,rgba(0,0,0,0.18),transparent_38%,rgba(0,0,0,0.2))]" />
      <div className="pointer-events-none absolute left-0 top-0 h-16 w-64 bg-black" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-72 bg-black" />
    </div>
  );
}

export const Biomech3DCanvas: React.FC<Biomech3DCanvasProps> = ({ mode = 'anatomy' }) => {
  if (mode === 'runner') {
    return <RunningAthleteModel />;
  }

  return (
    <div className="absolute inset-0 z-10 overflow-hidden bg-black">
      <iframe
        title="Ecorche Anatomy Human Male Musculature"
        src={SKETCHFAB_EMBED_URL}
        className="absolute inset-0 h-full w-full border-0 bg-black [filter:brightness(0.68)_contrast(1.18)_saturate(1.08)]"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />

      <div className="pointer-events-none absolute left-0 top-0 z-20 h-24 w-[320px] bg-black" />
      <div className="pointer-events-none absolute right-0 top-0 z-30 h-24 w-24 bg-black" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-20 w-[260px] bg-black" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-30 h-20 w-[300px] bg-black" />
    </div>
  );
};
