"""
ATHLIXIR Report Generator — HTML athlete biomechanics report.
"""

from __future__ import annotations

from datetime import datetime, timezone
from html import escape
from typing import Any


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

    def li(items: list[str]) -> str:
        if not items:
            return "<li>—</li>"
        return "".join(f"<li>{escape(str(x))}</li>" for x in items)

    progress_html = ""
    if progress.get("hasPrevious"):
        progress_html = f"""
        <h2>Progress vs previous scan</h2>
        <ul>
          <li>Cadence: {escape(str(progress.get('cadenceProgress') or '—'))}</li>
          <li>GCT: {escape(str(progress.get('gctProgress') or '—'))}</li>
          <li>Stride: {escape(str(progress.get('strideProgress') or '—'))}</li>
        </ul>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>ATHLIXIR Report — {escape(analysis_id[:8])}</title>
  <style>
    body {{ font-family: system-ui, sans-serif; background: #0a0a0f; color: #e4e4e7; padding: 2rem; max-width: 720px; margin: auto; }}
    h1 {{ color: #a78bfa; }}
    h2 {{ color: #c4b5fd; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5rem; }}
    .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }}
    .card {{ background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 1rem; }}
    .score {{ font-size: 2rem; font-weight: 800; }}
    ul {{ padding-left: 1.25rem; }}
    li {{ margin: 0.35rem 0; }}
    .meta {{ color: #71717a; font-size: 0.75rem; }}
  </style>
</head>
<body>
  <h1>ATHLIXIR Biomechanics Report</h1>
  <p class="meta">Analysis {escape(analysis_id)} · {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</p>
  <p><strong>Classification:</strong> {escape(classification.get('athleteLevel') or scores.get('athleteLevel') or '—')}</p>

  <div class="grid">
    <div class="card"><div class="score">{scores.get('performanceScore', '—')}</div>Performance</div>
    <div class="card"><div class="score">{scores.get('efficiencyScore', '—')}</div>Efficiency</div>
    <div class="card"><div class="score">{injury.get('level', '—')}</div>Injury risk</div>
  </div>

  <h2>Running metrics</h2>
  <ul>
    <li>Cadence: {metrics.get('cadence', '—')} SPM</li>
    <li>Ground contact: {metrics.get('gct', '—')} ms</li>
    <li>Stride length: {metrics.get('strideLength', '—')} m</li>
    <li>Symmetry: {metrics.get('symmetry', '—')}</li>
    <li>Oscillation: {metrics.get('oscillation', '—')} cm</li>
  </ul>

  <h2>Norm comparison ({escape(benchmarks.get('profileLabel') or '')})</h2>
  <ul>
    <li>Cadence: {benchmarks.get('cadenceLevel', '—')}</li>
    <li>GCT: {benchmarks.get('gctLevel', '—')}</li>
    <li>Stride: {benchmarks.get('strideLevel', '—')}</li>
  </ul>

  {progress_html}

  <h2>Strengths</h2>
  <ul>{li(insights.get('strengths') or [])}</ul>

  <h2>Weaknesses</h2>
  <ul>{li(insights.get('weaknesses') or [])}</ul>

  <h2>Observations</h2>
  <ul>{li(insights.get('observations') or [])}</ul>

  <h2>Recommendations</h2>
  <ul>{li(recommendations)}</ul>
</body>
</html>"""
