export function generateSportsScienceReportHtml(
  analysisId: string,
  athleteName: string,
  data: {
    athlete: any;
    metrics: any;
    scores: any;
    benchmarks: any;
    injuryRisk: any;
    aiInsights: any;
    aiRecommendations: any;
    aiSummary: string;
    aiPotential: any;
    aiProgressAnalysis: any;
    aiTimeline: any[];
    createdAt: string;
  },
): string {
  const dateStr = new Date(data.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const metrics = data.metrics || {};
  const benchmarkLevels = data.benchmarks?.levels || {
    cadence: 'State',
    gct: 'State',
    strideLength: 'State',
  };

  const timelineItemsHtml = (data.aiTimeline || [])
    .map(
      (item) => `
    <div class="timeline-card border-left-${item.severity === 'warning' ? 'warning' : item.severity === 'optimal' ? 'optimal' : 'normal'}">
      <div class="timeline-time">${item.time}</div>
      <div class="timeline-phase">${item.phase}</div>
      <div class="timeline-event">${item.event}</div>
    </div>
  `,
    )
    .join('');

  const strengthsHtml = (data.aiInsights?.strengths || [])
    .map(
      (s: string) =>
        `<li class="strength-item"><span class="icon">✓</span> ${s}</li>`,
    )
    .join('');

  const weaknessesHtml = (data.aiInsights?.weaknesses || [])
    .map(
      (w: string) =>
        `<li class="weakness-item"><span class="icon">⚠</span> ${w}</li>`,
    )
    .join('');

  const drillsHtml = (data.aiRecommendations?.drills || [])
    .map((d: string) => `<div class="pill drill">${d}</div>`)
    .join('');

  const exercisesHtml = (data.aiRecommendations?.correctiveExercises || [])
    .map((e: string) => `<div class="pill exercise">${e}</div>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATHLIXIR High-Performance Sports Science Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Space+Mono:wght@400;700&display=swap');
    
    :root {
      --bg-dark: #08080C;
      --card-bg: rgba(13, 13, 20, 0.65);
      --border-color: rgba(255, 255, 255, 0.05);
      --primary: #FF4F21;
      --primary-glow: rgba(255, 79, 33, 0.15);
      --cyan: #22D3EE;
      --cyan-glow: rgba(34, 211, 238, 0.15);
      --emerald: #10B981;
      --amber: #F59E0B;
      --rose: #EF4444;
      --text-main: #FFFFFF;
      --text-muted: #8E8EA0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Outfit', sans-serif;
      line-height: 1.5;
      padding: 40px;
      max-width: 1100px;
      margin: 0 auto;
    }

    /* Header Panel */
    .report-header {
      border: 1px border-solid var(--border-color);
      background: var(--card-bg);
      border-radius: 24px;
      padding: 30px;
      backdrop-filter: blur(12px);
      margin-bottom: 30px;
      position: relative;
      overflow: hidden;
    }

    .report-header::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
      pointer-events: none;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-badge {
      background: linear-gradient(135deg, var(--primary) 0%, #FF8433 100%);
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .logo-title {
      font-weight: 800;
      font-size: 18px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .scan-meta {
      text-align: right;
    }

    .scan-id {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .scan-date {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 4px;
    }

    .athlete-card {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .athlete-info-block .label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.15em;
      margin-bottom: 4px;
    }

    .athlete-info-block .value {
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
    }

    /* Score Capsule */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      position: relative;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.02);
    }

    .kpi-card.highlighted {
      border-color: rgba(255, 79, 33, 0.2);
      box-shadow: 0 0 20px rgba(255, 79, 33, 0.03);
    }

    .kpi-score {
      font-size: 38px;
      font-weight: 900;
      background: linear-gradient(to right, #FFF 0%, var(--text-muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }

    .kpi-score.primary-color {
      background: linear-gradient(135deg, var(--primary) 0%, #FF8433 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .kpi-score.cyan-color {
      background: linear-gradient(135deg, var(--cyan) 0%, #6EE7B7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }

    /* Double Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 24px;
      backdrop-filter: blur(12px);
    }

    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-title.primary-color { color: var(--primary); }
    .card-title.cyan-color { color: var(--cyan); }

    /* Summary styling */
    .summary-text {
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
    }

    /* Metrics Table */
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
    }

    .metrics-table th {
      text-align: left;
      padding: 10px 14px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }

    .metrics-table td {
      padding: 14px;
      font-size: 13px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }

    .metrics-table tr:last-child td {
      border-bottom: none;
    }

    .metric-name {
      font-weight: 600;
      color: var(--text-main);
    }

    .metric-value {
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 14px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge.elite { background: rgba(168, 85, 247, 0.15); color: #C084FC; border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge.national { background: rgba(34, 211, 238, 0.15); color: var(--cyan); border: 1px solid rgba(34, 211, 238, 0.3); }
    .badge.state { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge.district { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.3); }

    /* Strengths and Weaknesses */
    .insights-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .strength-item, .weakness-item {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .strength-item {
      background: rgba(16, 185, 129, 0.04);
      border: 1px solid rgba(16, 185, 129, 0.15);
      color: #D1FAE5;
    }

    .strength-item .icon { color: var(--emerald); font-weight: bold; }

    .weakness-item {
      background: rgba(245, 158, 11, 0.04);
      border: 1px solid rgba(245, 158, 11, 0.15);
      color: #FEF3C7;
    }

    .weakness-item .icon { color: var(--amber); font-weight: bold; }

    /* Timeline events */
    .timeline-container {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .timeline-card {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px 18px;
      position: relative;
    }

    .timeline-card.border-left-optimal { border-left: 4px solid var(--emerald); }
    .timeline-card.border-left-warning { border-left: 4px solid var(--primary); }
    .timeline-card.border-left-normal { border-left: 4px solid var(--cyan); }

    .timeline-time {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
    }

    .timeline-phase {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 2px;
      letter-spacing: 0.05em;
    }

    .timeline-event {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.4;
    }

    /* Recommendations Pill container */
    .recommendations-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .pills-group {
      background: rgba(0, 0, 0, 0.15);
      border: 1px solid var(--border-color);
      padding: 16px;
      border-radius: 16px;
    }

    .pills-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.15em;
      margin-bottom: 12px;
    }

    .pills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pill {
      font-size: 10px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pill.drill { background: rgba(255, 79, 33, 0.08); color: var(--primary); border: 1px solid rgba(255, 79, 33, 0.2); }
    .pill.exercise { background: rgba(34, 211, 238, 0.08); color: var(--cyan); border: 1px solid rgba(34, 211, 238, 0.2); }

    /* Footer stamp */
    .report-footer {
      text-align: center;
      margin-top: 40px;
      border-top: 1px solid var(--border-color);
      padding-top: 20px;
      color: var(--text-muted);
      font-size: 9px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- Report Header -->
  <div class="report-header">
    <div class="header-top">
      <div class="logo-container">
        <div class="logo-badge">ATHLIXIR</div>
        <div class="logo-title">Sports Science Report</div>
      </div>
      <div class="scan-meta">
        <div class="scan-id">SCAN DATA ID: ${analysisId.toUpperCase()}</div>
        <div class="scan-date">${dateStr}</div>
      </div>
    </div>

    <!-- Athlete Metadata -->
    <div class="athlete-card">
      <div class="athlete-info-block">
        <div class="label">Athlete</div>
        <div class="value">${athleteName}</div>
      </div>
      <div class="athlete-info-block">
        <div class="label">Event Focus</div>
        <div class="value">${data.athlete.event}</div>
      </div>
      <div class="athlete-info-block">
        <div class="label">Age Division</div>
        <div class="value">${data.athlete.ageGroup}</div>
      </div>
      <div class="athlete-info-block">
        <div class="label">Potential Tier</div>
        <div class="value" style="color: var(--cyan);">${data.aiPotential?.potential || 'District Division'}</div>
      </div>
    </div>
  </div>

  <!-- Performance Scores -->
  <div class="kpi-row">
    <div class="kpi-card highlighted">
      <div class="kpi-score primary-color">${data.scores.performanceScore}</div>
      <div class="kpi-label">Performance Index</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-score cyan-color">${data.scores.efficiencyScore}%</div>
      <div class="kpi-label">Sprint Efficiency</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-score">${data.scores.biomechanicsScore || '—'}</div>
      <div class="kpi-label">Biomechanics Rating</div>
    </div>
  </div>

  <!-- Double Layout Section -->
  <div class="layout-grid">
    
    <!-- Left Panel: Coach Analysis and Strengths/Weaknesses -->
    <div class="space-y" style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Summarized Scientific Analysis -->
      <div class="card">
        <div class="card-title primary-color">Coach Telemetry Evaluation</div>
        <p class="summary-text">${data.aiSummary}</p>
        
        <div class="pills-group" style="margin-top: 10px;">
          <div class="pills-title">Forecast & Potential Analysis</div>
          <p class="summary-text" style="font-size: 12px; margin-bottom: 0; color: var(--text-muted);">${data.aiPotential?.reasoning || 'No historical potential model loaded.'}</p>
        </div>
      </div>

      <!-- Strengths and Weaknesses -->
      <div class="card">
        <div class="card-title cyan-color">Biomechanical Observations</div>
        <div class="insights-list">
          ${strengthsHtml}
          ${weaknessesHtml}
        </div>
      </div>

    </div>

    <!-- Right Panel: Deterministic Metrics Table -->
    <div class="card" style="height: fit-content;">
      <div class="card-title">Deterministic Telemetry</div>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Telemetry Parameter</th>
            <th>Reading</th>
            <th>Tier Standard</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="metric-name">Turnover Cadence</td>
            <td class="metric-value" style="color: var(--primary);">${metrics.cadence ?? '—'} <span style="font-size: 8px;">SPM</span></td>
            <td><span class="badge ${String(benchmarkLevels.cadence ?? 'State').toLowerCase()}">${benchmarkLevels.cadence ?? 'State'}</span></td>
          </tr>
          <tr>
            <td class="metric-name">Ground Contact (GCT)</td>
            <td class="metric-value" style="color: var(--cyan);">${metrics.gct ?? '—'} <span style="font-size: 8px;">ms</span></td>
            <td><span class="badge ${String(benchmarkLevels.gct ?? 'State').toLowerCase()}">${benchmarkLevels.gct ?? 'State'}</span></td>
          </tr>
          <tr>
            <td class="metric-name">Stride Amplitude</td>
            <td class="metric-value">${metrics.strideLength ?? '—'} <span style="font-size: 8px;">m</span></td>
            <td><span class="badge ${String(benchmarkLevels.strideLength ?? 'State').toLowerCase()}">${benchmarkLevels.strideLength ?? 'State'}</span></td>
          </tr>
          <tr>
            <td class="metric-name">Symmetry Metric</td>
            <td class="metric-value" style="color: var(--emerald);">${metrics.symmetry ?? '—'}%</td>
            <td><span class="badge elite">Elite</span></td>
          </tr>
          <tr>
            <td class="metric-name">Vertical Oscillation</td>
            <td class="metric-value">${data.metrics.oscillation ?? '—'} <span style="font-size: 8px;">cm</span></td>
            <td><span class="badge state">State</span></td>
          </tr>
          <tr>
            <td class="metric-name">Knee Overstride</td>
            <td class="metric-value">${data.metrics.overstrideAngle ?? '—'}°</td>
            <td><span class="badge district">District</span></td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- Progress and Recommendations Layout -->
  <div class="layout-grid">
    
    <!-- Left: Training Recommendations -->
    <div class="card">
      <div class="card-title primary-color">Targeted Athletic Adaptation Plan</div>
      <p class="summary-text" style="font-size: 12px; margin-bottom: 20px;">Based on detected asymmetry and GCT flags, execute the following corrective athletic progression drills over the next training cycle.</p>
      
      <div class="recommendations-grid">
        <div class="pills-group">
          <div class="pills-title">Coaching Drills Focus</div>
          <div class="pills-container">
            ${drillsHtml}
          </div>
        </div>
        <div class="pills-group">
          <div class="pills-title">Corrective Exercises</div>
          <div class="pills-container">
            ${exercisesHtml}
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Event Timeline Highlights -->
    <div class="card">
      <div class="card-title cyan-color">Sprint Breakdown Timeline</div>
      <div class="timeline-container">
        ${timelineItemsHtml}
      </div>
    </div>

  </div>

  <!-- Footer Stamp -->
  <div class="report-footer">
    ATHLIXIR HIGH-PERFORMANCE BIOMECHANICS LABS © 2026. CONFIDENTIAL SPORTS INTELLIGENCE RECORD.
  </div>

</body>
</html>
  `;
}
