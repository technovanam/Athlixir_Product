# 📊 MONITORING & ALERTING SETUP GUIDE

**Enterprise-Grade Monitoring for ATHLIXIR Production**

---

## TABLE OF CONTENTS

1. [Monitoring Architecture](#monitoring-architecture)
2. [Metrics Collection](#metrics-collection)
3. [Dashboard Setup](#dashboard-setup)
4. [Alerting Rules](#alerting-rules)
5. [Log Aggregation](#log-aggregation)
6. [Performance Tracking](#performance-tracking)
7. [Health Checks](#health-checks)
8. [Incident Response](#incident-response)

---

## MONITORING ARCHITECTURE

### Tool Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│   (NestJS Backend, Next.js Frontend, Python AI Engine)      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Instruments
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                  Metrics Collection                         │
│  (Prometheus, StatsD, Cloud Trace, OpenTelemetry)          │
└──────────────────┬──────────────────────────────────────────┘
                   │ Exports
                   ↓
┌──────────────────────────────────────────────────────────────┐
│              Time Series Database / Storage                 │
│  (CloudWatch, Datadog, Prometheus Remote Storage)           │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┬───────────┐
         ↓                    ↓           ↓
    ┌────────────┐    ┌────────────┐  ┌────────────┐
    │ Grafana    │    │ Datadog    │  │ CloudWatch │
    │ Dashboards │    │ Dashboard  │  │ Console    │
    └────────────┘    └────────────┘  └────────────┘
         │
    ┌────────────────────────────────────────┐
    │      Alert Rules & Thresholds          │
    └────────────────────────────────────────┘
         │
    ┌────────┬──────────┬──────────┐
    ↓        ↓          ↓          ↓
  Slack  PagerDuty   Email     SMS
```

### Recommended Tools

**FREE/OPEN-SOURCE:**
- Prometheus (metrics)
- Grafana (dashboards)
- ELK Stack (logs)
- Alertmanager (alerting)

**PAID (with free tiers):**
- Datadog (full APM)
- New Relic (full APM)
- CloudWatch (AWS)
- Sentry (error tracking)

---

## METRICS COLLECTION

### Application Metrics

#### Backend (NestJS)

```bash
# Install Prometheus client
npm install prom-client

# Create metrics.middleware.ts
```

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import * as prometheus from 'prom-client';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const labels = {
        method: req.method,
        route: req.route?.path || req.baseUrl,
        status: res.statusCode,
      };

      // Record metrics
      httpRequestDuration.labels(labels).observe(duration / 1000);
      httpRequestTotal.labels(labels).inc();
    });

    next();
  }
}

// Define metrics
export const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const databaseOperationDuration = new prometheus.Histogram({
  name: 'database_operation_duration_seconds',
  help: 'Duration of database operations',
  labelNames: ['operation', 'collection'],
});

export const videoProcessingDuration = new prometheus.Histogram({
  name: 'video_processing_duration_seconds',
  help: 'Duration of video processing',
  labelNames: ['status'],
});

export const activeUsers = new prometheus.Gauge({
  name: 'active_users_count',
  help: 'Number of active users',
});
```

#### Expose Metrics Endpoint

```typescript
// main.ts
import * as prometheus from 'prom-client';

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Infrastructure Metrics

#### Docker/Kubernetes

```yaml
# docker-compose.yml add Prometheus
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
```

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'athlixir-server'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'

  - job_name: 'athlixir-ai-engine'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'

  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
```

### Business Metrics

```typescript
// Track business metrics
export const userSignups = new prometheus.Counter({
  name: 'user_signups_total',
  help: 'Total user signups',
  labelNames: ['source'],
});

export const videoUploads = new prometheus.Counter({
  name: 'video_uploads_total',
  help: 'Total video uploads',
});

export const analysisCompleted = new prometheus.Counter({
  name: 'analysis_completed_total',
  help: 'Total analyses completed',
  labelNames: ['status'],
});

export const userRetention = new prometheus.Gauge({
  name: 'user_retention_rate',
  help: 'Daily user retention percentage',
});
```

---

## DASHBOARD SETUP

### Grafana Dashboard

#### Installation

```bash
# Docker Compose
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3100:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
```

#### System Health Dashboard

```json
{
  "dashboard": {
    "title": "ATHLIXIR System Health",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "API Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~'5..'}[5m])"
          }
        ]
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "active_users_count"
          }
        ]
      },
      {
        "title": "Video Processing Queue",
        "targets": [
          {
            "expr": "queue_size"
          }
        ]
      },
      {
        "title": "Database Connection Pool",
        "targets": [
          {
            "expr": "database_connections_active"
          }
        ]
      }
    ]
  }
}
```

#### Performance Dashboard

```json
{
  "dashboard": {
    "title": "ATHLIXIR Performance",
    "panels": [
      {
        "title": "Page Load Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, page_load_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Bundle Size Trend",
        "targets": [
          {
            "expr": "bundle_size_bytes"
          }
        ]
      },
      {
        "title": "First Contentful Paint (FCP)",
        "targets": [
          {
            "expr": "fcp_duration_seconds"
          }
        ]
      },
      {
        "title": "Video Analysis Duration",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, video_processing_duration_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

#### Business Metrics Dashboard

```json
{
  "dashboard": {
    "title": "ATHLIXIR Business Metrics",
    "panels": [
      {
        "title": "Daily Active Users",
        "targets": [
          {
            "expr": "increase(user_logins_total[1d])"
          }
        ]
      },
      {
        "title": "Video Uploads Per Hour",
        "targets": [
          {
            "expr": "rate(video_uploads_total[1h])"
          }
        ]
      },
      {
        "title": "Analysis Success Rate",
        "targets": [
          {
            "expr": "increase(analysis_completed_total{status='success'}[1h]) / increase(analysis_completed_total[1h])"
          }
        ]
      },
      {
        "title": "User Retention Rate",
        "targets": [
          {
            "expr": "user_retention_rate"
          }
        ]
      }
    ]
  }
}
```

---

## ALERTING RULES

### Prometheus Alert Rules

```yaml
# alerts.yml
groups:
  - name: athlixir_alerts
    interval: 1m
    rules:

      # CRITICAL ALERTS
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API latency"
          description: "p95 latency is {{ $value }}s"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL is not responding"

      - alert: HighCPUUsage
        expr: node_cpu_usage > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value | humanizePercentage }}"

      - alert: HighMemoryUsage
        expr: node_memory_usage > 0.85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # HIGH SEVERITY ALERTS
      - alert: VideoProcessingBacklog
        expr: queue_size > 100
        for: 10m
        labels:
          severity: high
        annotations:
          summary: "Video processing queue backlog"
          description: "Queue size is {{ $value }} videos"

      - alert: LowDiskSpace
        expr: node_filesystem_free_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Low disk space"
          description: "{{ humanize $value }}% free"

      - alert: SlowDatabase
        expr: histogram_quantile(0.95, database_operation_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Slow database queries"
          description: "p95 query time is {{ $value }}s"

      # MEDIUM SEVERITY ALERTS
      - alert: HighMemoryUsageWarning
        expr: node_memory_usage > 0.7
        for: 10m
        labels:
          severity: medium
        annotations:
          summary: "Memory usage is high"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: CacheHitRateLow
        expr: cache_hit_rate < 0.7
        for: 15m
        labels:
          severity: medium
        annotations:
          summary: "Cache hit rate is low"
          description: "Hit rate is {{ $value | humanizePercentage }}"
```

### Alert Routing (Alertmanager)

```yaml
# alertmanager.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  receiver: 'pagerduty-critical'
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # CRITICAL: Immediate PagerDuty
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true
      group_wait: 0s

    # HIGH: PagerDuty + Slack
    - match:
        severity: high
      receiver: 'pagerduty-high'
      continue: true
      group_wait: 1m

    # MEDIUM: Slack only
    - match:
        severity: medium
      receiver: 'slack-notifications'
      group_wait: 5m

receivers:
  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_SERVICE_KEY'
        description: '{{ .GroupLabels.alertname }}'

  - name: 'pagerduty-high'
    pagerduty_configs:
      - service_key: 'YOUR_SERVICE_KEY'
        severity: 'error'

  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## LOG AGGREGATION

### ELK Stack Setup

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000/tcp"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
```

### Logstash Pipeline

```conf
# logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
  file {
    path => "/var/log/athlixir/*.log"
    codec => "json"
  }
}

filter {
  if [type] == "api" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
  }

  if [level] == "ERROR" {
    mutate {
      add_field => { "severity" => "critical" }
    }
  }
}

output:
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "athlixir-%{+YYYY.MM.dd}"
  }
}
```

### Kibana Dashboards

**Error Analysis Dashboard:**
- Errors by endpoint
- Error trends over time
- Top error types
- Stack traces

**Performance Dashboard:**
- Request latency distribution
- Slow query analysis
- Request rate by endpoint
- Cache hit/miss rates

**User Activity Dashboard:**
- Active users over time
- User actions per endpoint
- Signup/login trends
- Feature adoption

---

## PERFORMANCE TRACKING

### Real User Monitoring (RUM)

```typescript
// frontend/lib/analytics.ts
import { webVitals } from 'web-vitals';

webVitals.onCLS(metric => {
  sendMetric('CLS', metric.value);
});

webVitals.onFID(metric => {
  sendMetric('FID', metric.value);
});

webVitals.onFCP(metric => {
  sendMetric('FCP', metric.value);
});

webVitals.onLCP(metric => {
  sendMetric('LCP', metric.value);
});

function sendMetric(name: string, value: number) {
  // Send to Prometheus/Datadog
  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metric: name, value }),
  });
}
```

### APM (Application Performance Monitoring)

```typescript
// backend/lib/tracing.ts
import { NodeTracerProvider } from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const tracerProvider = new NodeTracerProvider();
const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14250',
});

tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(jaegerExporter)
);
```

---

## HEALTH CHECKS

### Liveness Probe

```typescript
// server/health.controller.ts
@Get('/health/live')
liveness() {
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
  };
}
```

### Readiness Probe

```typescript
// server/health.controller.ts
@Get('/health/ready')
async readiness() {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    firebase: await checkFirebase(),
    storage: await checkStorage(),
  };

  const allHealthy = Object.values(checks).every(check => check === true);

  return {
    status: allHealthy ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString(),
  };
}
```

### Kubernetes Health Probes

```yaml
# kubernetes/deployment.yml
spec:
  containers:
    - name: athlixir-server
      livenessProbe:
        httpGet:
          path: /api/health/live
          port: 3001
        initialDelaySeconds: 10
        periodSeconds: 10

      readinessProbe:
        httpGet:
          path: /api/health/ready
          port: 3001
        initialDelaySeconds: 5
        periodSeconds: 5
```

---

## INCIDENT RESPONSE

### On-Call Rotation

```
Week 1: Engineer A (Mon-Sun)
Week 2: Engineer B (Mon-Sun)
Week 3: Engineer C (Mon-Sun)
Week 4: Engineer D (Mon-Sun)

Escalation:
1. On-call engineer (< 5 min response)
2. Tech lead (if no response after 10 min)
3. Engineering manager (if critical not resolved in 30 min)
```

### Incident Severity Levels

```
CRITICAL (P1):
  - Error rate > 5% for > 1 minute → AUTO PAGE
  - Database unavailable → AUTO PAGE
  - Authentication broken → AUTO PAGE
  - Data corruption detected → AUTO PAGE
  - Response time p95 > 5s for > 2 min → AUTO PAGE

HIGH (P2):
  - Error rate 1-5% for > 5 min → PAGE after review
  - Response time p95 > 2s for > 5 min → PAGE after review
  - Queue backlog > 1000 → PAGE after review
  - Disk space < 10% → PAGE after review

MEDIUM (P3):
  - Error rate < 1% but elevated → SLACK + create ticket
  - Cache hit rate < 70% → SLACK + create ticket
  - Memory usage > 85% → SLACK + create ticket

LOW (P4):
  - Minor performance degradation
  - Non-critical feature broken
  - Create ticket for next sprint
```

### Incident Response Checklist

```
1. IMMEDIATE (0-5 min)
   [ ] Acknowledge alert
   [ ] Assemble incident commander
   [ ] Open war room (Slack/Zoom)
   [ ] Post status message

2. INVESTIGATE (5-15 min)
   [ ] Reproduce issue
   [ ] Check metrics/logs
   [ ] Identify root cause
   [ ] Assess impact

3. REMEDIATE (15-30 min)
   [ ] Implement fix OR rollback
   [ ] Verify fix works
   [ ] Monitor for recurrence
   [ ] Notify stakeholders

4. DOCUMENT (30+ min)
   [ ] Write incident report
   [ ] Timeline of events
   [ ] Root cause analysis
   [ ] Action items
   [ ] Post-mortem scheduled

5. POST-INCIDENT (within 2 days)
   [ ] Root cause verified
   [ ] Prevention implemented
   [ ] Team training completed
   [ ] Monitoring improved
```

---

## MONITORING CHECKLIST

### Before Production Launch

```
[ ] Prometheus setup and scraping metrics
[ ] Grafana dashboards created (System, Performance, Business)
[ ] Alertmanager configured and routing
[ ] Slack/PagerDuty integration tested
[ ] ELK stack collecting logs
[ ] Kibana dashboards created
[ ] APM tools configured (Datadog or Jaeger)
[ ] Health check endpoints operational
[ ] Liveness/readiness probes working
[ ] On-call schedule activated
[ ] Incident playbooks documented
[ ] Team trained on dashboards
[ ] Critical alerts tested
[ ] Rollback procedures tested
```

---

**Monitoring Status**: Ready for production  
**Dashboard URL**: `http://grafana.athlixir.com`  
**Alerts**: Routed to #alerts Slack channel and PagerDuty

