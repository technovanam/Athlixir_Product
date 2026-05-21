"""
ATHLIXIR Professional Report Generator — print-ready HTML biomechanics report.

Opens in browser tab. Browser "Print → Save as PDF" converts to PDF with zero dependencies.
"""

from __future__ import annotations

from datetime import datetime, timezone
from html import escape
from typing import Any


def _li(items: list[str]) -> str:
    if not items:
        return "<li>—</li>"
    return "".join(f"<li>{escape(str(x))}</li>" for x in items)


def _level_color(level: str) -> str:
    colors = {
        "Elite": "#a78bfa",
        "National": "#60a5fa",
        "State": "#34d399",
        "District": "#fbbf24",
        "Below District": "#f87171",
    }
    return colors.get(level, "#71717a")


def _risk_color(level: str) -> str:
    return {
        "Minimal": "#34d399",
        "Low": "#86efac",
        "Moderate": "#fbbf24",
        "High": "#f87171",
    }.get(level, "#71717a")


def _score_ring(score: int | str, label: str, color: str = "#FF4F21") -> str:
    try:
        val = int(score)
    except (TypeError, ValueError):
        val = 0
    pct = min(max(val, 0), 100)
    r = 36
    circ = 2 * 3.14159 * r
    offset = circ * (1 - pct / 100)
    return f"""
    <div class="score-ring-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="{r}" fill="none" stroke="#27272a" stroke-width="6"/>
        <circle cx="44" cy="44" r="{r}" fill="none" stroke="{color}"
          stroke-width="6" stroke-linecap="round"
          stroke-dasharray="{circ:.2f}" stroke-dashoffset="{offset:.2f}"
          transform="rotate(-90 44 44)"/>
        <text x="44" y="48" text-anchor="middle" fill="white"
          font-size="18" font-weight="800" font-family="system-ui">{val}</text>
      </svg>
      <div class="ring-label">{escape(label)}</div>
    </div>"""


def generate_html_report(
    analysis_id: str,
    intelligence: dict[str, Any],
) -> str:
    metrics = intelligence.get("metrics") or {}
    benchmarks = intelligence.get("benchmarks") or {}
    scores = intelligence.get("scores") or {}
    insights = intelligence.get("insights") or {}
    recommendations = intelligence.get("recommendations") or []
    progress = intelligence.get("progress") or {}
    injury = intelligence.get("injuryRisk") or {}
    classification = intelligence.get("classification") or {}

    athlete_level = classification.get("athleteLevel") or scores.get("athleteLevel") or "—"
    perf = scores.get("performanceScore", "—")
    eff = scores.get("efficiencyScore", "—")
    bio = scores.get("biomechanicsScore", "—")
    inj_level = injury.get("level", "—")
    inj_area = injury.get("riskArea", "None")
    profile_label = benchmarks.get("profileLabel", "")
    now = datetime.now(timezone.utc).strftime("%d %B %Y · %H:%M UTC")

    cad_lvl = benchmarks.get("cadenceLevel", "—")
    gct_lvl = benchmarks.get("gctLevel", "—")
    str_lvl = benchmarks.get("strideLevel", "—")

    progress_html = ""
    if progress.get("hasPrevious"):
        progress_html = f"""
        <section class="section">
          <h2>📈 Progress vs Previous Session</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Cadence</div>
              <div class="metric-value progress-val">{escape(str(progress.get('cadenceProgress') or '—'))}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">GCT</div>
              <div class="metric-value progress-val">{escape(str(progress.get('gctProgress') or '—'))}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Stride Length</div>
              <div class="metric-value progress-val">{escape(str(progress.get('strideProgress') or '—'))}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Symmetry</div>
              <div class="metric-value progress-val">{escape(str(progress.get('symmetryProgress') or '—'))}</div>
            </div>
          </div>
        </section>"""

    recs_html = ""
    if recommendations:
        recs_html = "".join(
            f'<div class="rec-item"><span class="rec-dot">▶</span>{escape(str(r))}</div>'
            for r in recommendations
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>ATHLIXIR Biomechanics Report · {escape(analysis_id[:8])}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, 'Inter', system-ui, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      padding: 2.5rem;
      max-width: 860px;
      margin: auto;
      line-height: 1.6;
    }}

    /* ── HEADER ── */
    .report-header {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #27272a;
      margin-bottom: 2rem;
    }}
    .brand {{ display: flex; align-items: center; gap: 0.75rem; }}
    .brand-logo {{
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #FF4F21, #FF8433);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 18px; color: white;
    }}
    .brand-name {{ font-size: 1.25rem; font-weight: 900; letter-spacing: 0.08em; color: white; }}
    .brand-sub {{ font-size: 0.65rem; color: #71717a; text-transform: uppercase; letter-spacing: 0.12em; }}
    .report-meta {{ text-align: right; font-size: 0.7rem; color: #52525b; }}
    .report-meta strong {{ display: block; color: #a1a1aa; font-size: 0.75rem; margin-bottom: 0.2rem; }}

    /* ── CLASSIFICATION BANNER ── */
    .classification-banner {{
      background: linear-gradient(135deg, #FF4F21/10, transparent);
      border: 1px solid #FF4F21/30;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 79, 33, 0.06);
      border-color: rgba(255, 79, 33, 0.25);
    }}
    .tier-badge {{
      background: #FF4F21;
      color: white;
      font-weight: 900;
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
    }}
    .tier-label {{ font-size: 1rem; font-weight: 700; color: white; }}
    .tier-sub {{ font-size: 0.7rem; color: #71717a; margin-top: 0.1rem; }}

    /* ── SECTION ── */
    .section {{ margin-bottom: 2rem; }}
    h2 {{
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #71717a;
      margin-bottom: 1rem;
    }}

    /* ── SCORE RINGS ── */
    .score-rings {{
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }}
    .score-ring-wrap {{ text-align: center; }}
    .ring-label {{
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #71717a;
      margin-top: 0.3rem;
    }}

    /* ── METRICS GRID ── */
    .metrics-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 0.75rem;
    }}
    .metric-card {{
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 1rem;
    }}
    .metric-label {{
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #71717a;
      margin-bottom: 0.35rem;
    }}
    .metric-value {{
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
    }}
    .metric-unit {{ font-size: 0.7rem; color: #52525b; font-weight: 500; margin-left: 2px; }}
    .progress-val {{ font-size: 1.1rem; color: #34d399; }}

    /* ── BENCHMARK TABLE ── */
    .bench-table {{ width: 100%; border-collapse: collapse; font-size: 0.8rem; }}
    .bench-table th {{
      text-align: left;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #52525b;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #27272a;
    }}
    .bench-table td {{
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #18181b;
      color: #a1a1aa;
    }}
    .bench-table td.level {{
      font-weight: 800;
      font-size: 0.85rem;
    }}

    /* ── INJURY RISK ── */
    .injury-card {{
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #27272a;
      background: #18181b;
    }}
    .injury-level {{
      font-size: 1.25rem;
      font-weight: 900;
    }}
    .injury-area {{ font-size: 0.75rem; color: #71717a; }}

    /* ── INSIGHTS ── */
    .insight-block {{ margin-bottom: 1rem; }}
    .insight-title {{
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
    }}
    .insight-title.green {{ color: #34d399; }}
    .insight-title.amber {{ color: #fbbf24; }}
    .insight-title.zinc {{ color: #71717a; }}
    .insight-block ul {{ padding-left: 1.2rem; }}
    .insight-block li {{ font-size: 0.8rem; color: #d4d4d8; margin: 0.25rem 0; }}

    /* ── RECOMMENDATIONS ── */
    .rec-item {{
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-size: 0.8rem;
      color: #d4d4d8;
      padding: 0.6rem 0.75rem;
      background: #18181b;
      border-radius: 8px;
      margin-bottom: 0.4rem;
      border: 1px solid #27272a;
    }}
    .rec-dot {{ color: #FF4F21; font-size: 0.6rem; margin-top: 0.2rem; flex-shrink: 0; }}

    /* ── FOOTER ── */
    .report-footer {{
      margin-top: 3rem;
      padding-top: 1.25rem;
      border-top: 1px solid #27272a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.65rem;
      color: #3f3f46;
    }}

    /* ── PRINT ── */
    @media print {{
      body {{ background: white; color: #18181b; padding: 1rem; }}
      .report-header, .classification-banner, .metric-card, .injury-card, .rec-item {{
        border-color: #e4e4e7 !important;
        background: #f9fafb !important;
      }}
      h2 {{ color: #71717a !important; }}
      .metric-value, .tier-label {{ color: #18181b !important; }}
      body {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    }}
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="report-header">
    <div class="brand">
      <div class="brand-logo">A</div>
      <div>
        <div class="brand-name">ATHLIXIR</div>
        <div class="brand-sub">Biomechanics Intelligence Report</div>
      </div>
    </div>
    <div class="report-meta">
      <strong>Analysis ID</strong>
      {escape(analysis_id[:8])}…<br/>
      {escape(now)}
      {f"<br/>{escape(profile_label)}" if profile_label else ""}
    </div>
  </header>

  <!-- CLASSIFICATION -->
  <div class="classification-banner">
    <div class="tier-badge">{escape(athlete_level)}</div>
    <div>
      <div class="tier-label">Athlete Classification</div>
      <div class="tier-sub">Based on biomechanics performance score and norm benchmarks</div>
    </div>
  </div>

  <!-- SCORE RINGS -->
  <section class="section">
    <h2>🎯 Performance Scores</h2>
    <div class="score-rings">
      {_score_ring(perf, "Performance", "#FF4F21")}
      {_score_ring(eff, "Efficiency", "#34d399")}
      {_score_ring(bio, "Biomechanics", "#a78bfa")}
      {_score_ring(injury.get('score', 0), "Injury Risk", _risk_color(inj_level))}
    </div>
  </section>

  <!-- RUNNING METRICS -->
  <section class="section">
    <h2>📊 Running Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Cadence</div>
        <div class="metric-value">{metrics.get('cadence', '—')}<span class="metric-unit">SPM</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ground Contact</div>
        <div class="metric-value">{metrics.get('gct', '—')}<span class="metric-unit">ms</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Stride Length</div>
        <div class="metric-value">{metrics.get('strideLength', '—')}<span class="metric-unit">m</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Symmetry</div>
        <div class="metric-value">{metrics.get('symmetry', '—')}<span class="metric-unit">index</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Oscillation</div>
        <div class="metric-value">{metrics.get('oscillation', '—')}<span class="metric-unit">cm</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Posture Lean</div>
        <div class="metric-value">{metrics.get('postureAngle', '—')}<span class="metric-unit">°</span></div>
      </div>
    </div>
  </section>

  <!-- NORM COMPARISON -->
  <section class="section">
    <h2>🏆 Benchmark Comparison{f" · {escape(profile_label)}" if profile_label else ""}</h2>
    <table class="bench-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Your Value</th>
          <th>Benchmark Level</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cadence</td>
          <td>{metrics.get('cadence', '—')} SPM</td>
          <td class="level" style="color:{_level_color(cad_lvl)}">{cad_lvl}</td>
        </tr>
        <tr>
          <td>Ground Contact Time</td>
          <td>{metrics.get('gct', '—')} ms</td>
          <td class="level" style="color:{_level_color(gct_lvl)}">{gct_lvl}</td>
        </tr>
        <tr>
          <td>Stride Length</td>
          <td>{metrics.get('strideLength', '—')} m</td>
          <td class="level" style="color:{_level_color(str_lvl)}">{str_lvl}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- INJURY RISK -->
  <section class="section">
    <h2>🛡️ Injury Risk Assessment</h2>
    <div class="injury-card">
      <div class="injury-level" style="color:{_risk_color(inj_level)}">{escape(inj_level)}</div>
      <div>
        <div style="font-size:0.8rem;color:#a1a1aa;font-weight:600">
          {f"Primary concern: {escape(inj_area)}" if inj_area and inj_area != "None" else "No significant biomechanical risk flags detected"}
        </div>
        <div class="injury-area">Rule-based biomechanical risk analysis</div>
      </div>
    </div>
  </section>

  {progress_html}

  <!-- AI INSIGHTS -->
  <section class="section">
    <h2>🧠 AI Insights</h2>
    <div class="insight-block">
      <div class="insight-title green">Strengths</div>
      <ul>{_li(insights.get('strengths') or [])}</ul>
    </div>
    <div class="insight-block">
      <div class="insight-title amber">Areas for Improvement</div>
      <ul>{_li(insights.get('weaknesses') or [])}</ul>
    </div>
    <div class="insight-block">
      <div class="insight-title zinc">Observations</div>
      <ul>{_li(insights.get('observations') or [])}</ul>
    </div>
  </section>

  <!-- RECOMMENDATIONS -->
  <section class="section">
    <h2>💪 Training Recommendations</h2>
    {recs_html or "<p style='color:#52525b;font-size:0.8rem'>No specific recommendations at this time.</p>"}
  </section>

  <!-- FOOTER -->
  <footer class="report-footer">
    <span>ATHLIXIR — AI Biomechanics Intelligence Platform</span>
    <span>Print or save as PDF using browser Print function (Ctrl+P)</span>
  </footer>

</body>
</html>"""
