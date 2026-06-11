# 🚀 DEPLOYMENT VERIFICATION CHECKLIST

**Pre-Launch, Launch, and Post-Launch Verification**

---

## PRE-DEPLOYMENT VERIFICATION (48 Hours Before)

### Code Quality

```bash
# ✅ All tests passing
npm run test --workspaces                    # All unit tests
npm run test:coverage --workspaces           # Check coverage >80%

# Expected output:
# Tests: 250+ passing
# Coverage: >80% statements

# ✅ No linting errors
npm run lint --workspaces

# Expected output:
# No errors found

# ✅ No TypeScript errors
npm run build                                # Client build
npm run build                                # Server build

# Expected output:
# ✓ Successfully compiled
# 0 type errors
```

### Dependency Security

```bash
# ✅ No critical vulnerabilities
npm audit

# Expected output:
# 0 critical
# 0 high (or resolved)
```

### Git Status

```bash
# ✅ All changes committed
git status

# Expected output:
# On branch main
# nothing to commit, working tree clean

# ✅ Version tagged
git tag -l | grep v1.0.0

# ✅ Changelog updated
cat CHANGELOG.md | head -20
```

### Database Preparation

```bash
# ✅ Database backup
gcloud sql backups create \
  --instance=athlixir-prod \
  --description="Pre-launch backup $(date)"

# ✅ Verify backup
gcloud sql backups list --instance=athlixir-prod

# Expected: Latest backup timestamp recent
```

### Environment Configuration

```bash
# ✅ Production secrets set
echo $FIREBASE_PROJECT_ID
echo $DATABASE_URL
echo $JWT_SECRET
echo $STRIPE_API_KEY

# Expected: All return values (not empty)

# ✅ No development configs
grep -r "localhost:3000" server/
grep -r "DEBUG=true" server/
grep -r "NODE_ENV=development" .env

# Expected: No matches
```

### Docker Images

```bash
# ✅ Build Docker images
docker-compose build --no-cache

# ✅ Verify images exist
docker images | grep athlixir

# Expected output:
# athlixir-server      latest
# athlixir-ai-engine   latest
# athlixir-client      latest
```

---

## STAGING VALIDATION (24 Hours Before)

### Staging Deployment

```bash
# ✅ Deploy to staging
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up -d

# ✅ Verify all services running
docker-compose -f docker-compose.staging.yml ps

# Expected output:
# NAME                    STATUS
# athlixir-client         Up 2 minutes
# athlixir-server         Up 2 minutes
# athlixir-ai-engine      Up 2 minutes
# postgres-staging        Up 2 minutes
```

### Application Health Check

```bash
# ✅ API health endpoint
curl -i http://localhost:3001/api/health

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/json
#
# {"status":"ok","timestamp":"..."}

# ✅ Frontend health check
curl -i http://localhost:3000

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: text/html
```

### Smoke Tests (Critical User Journeys)

```bash
# ✅ Signup flow
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test-staging@athlixir.com",
    "password":"TestPassword123!",
    "firstName":"Staging",
    "lastName":"Tester"
  }'

# Expected response:
# {"success":true,"user":{"id":"...","email":"..."},"token":"..."}

# ✅ Login flow
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test-staging@athlixir.com",
    "password":"TestPassword123!"
  }'

# Expected response:
# {"success":true,"token":"..."}

# ✅ Profile creation
TOKEN="<token from login>"
curl -X POST http://localhost:3001/api/athletes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Athlete",
    "age":25,
    "sport":"running"
  }'

# Expected response:
# {"success":true,"athlete":{"id":"...","name":"Test Athlete"}}
```

### Database Validation

```bash
# ✅ Database connectivity
docker-compose -f docker-compose.staging.yml exec postgres-staging \
  psql -U postgres -d athlixir_staging -c "SELECT COUNT(*) FROM users;"

# Expected output:
# count
# ------
#   1  (the test user we just created)

# ✅ Firebase connection
curl -s https://firestore.googleapis.com/v1/projects/athlixir-staging/databases/default \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)"

# Expected: Database metadata returned
```

### Security Headers Verification

```bash
# ✅ Security headers present
curl -i http://localhost:3001/api/health | grep -E "X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security"

# Expected output:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
```

---

## LAUNCH DAY VERIFICATION (Morning Of)

### Final Checks (2 Hours Before Launch)

```bash
# ✅ Pull latest code
git pull origin main

# ✅ Verify no uncommitted changes
git status

# Expected output:
# On branch main
# nothing to commit, working tree clean

# ✅ Run all tests one final time
npm run test --workspaces

# Expected: All tests passing

# ✅ Security scan
npm audit

# Expected: 0 critical, 0 high

# ✅ Lint check
npm run lint --workspaces

# Expected: No errors
```

### Production Environment Setup

```bash
# ✅ Verify production secrets
ssh prod-server "echo $FIREBASE_PROJECT_ID"
ssh prod-server "echo $NODE_ENV"

# Expected: Production values

# ✅ Verify firestore.rules deployed
curl https://firestore.googleapis.com/v1/projects/athlixir-prod/databases/default/documents/users \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)"

# ✅ Verify database backups
gcloud sql backups list --instance=athlixir-prod | head -5

# ✅ Verify SSL certificates
openssl s_client -connect api.athlixir.com:443 -showcerts | grep "Issuer:"

# Expected: Let's Encrypt or similar valid CA
```

### Team Readiness

```
[ ] Incident commander assigned
[ ] On-call engineer online
[ ] Slack channel #production-launch active
[ ] PagerDuty on-call schedule updated
[ ] Monitoring dashboards open
[ ] Rollback procedure tested
[ ] Communication plan ready
```

---

## DURING LAUNCH - REAL-TIME MONITORING

### First 5 Minutes (Canary 1%)

Monitor these metrics **CONTINUOUSLY**:

```
✅ Error Rate
   Expected: < 0.5%
   Monitor: CloudWatch → HTTP 5xx
   Alert if: > 1% for 30 seconds → Auto-rollback

✅ Response Time
   Expected: p95 < 500ms
   Monitor: CloudWatch → API latency
   Alert if: > 1000ms for 1 minute → Investigate

✅ Pod/Container Status
   Expected: All running
   Monitor: kubectl get pods
   Alert if: Any failed → Investigate

✅ Database Connections
   Expected: Normal (30-50 active)
   Monitor: CloudSQL metrics
   Alert if: > 100 connections → Connection leak

✅ CPU Usage
   Expected: 20-40%
   Monitor: CloudWatch → EC2 CPU
   Alert if: > 80% → Horizontal scale

✅ Memory Usage
   Expected: 30-50%
   Monitor: CloudWatch → Memory
   Alert if: > 85% → Memory leak alert
```

**Command to watch dashboard:**
```bash
watch -n 5 'kubectl get pods && kubectl top nodes'
```

### Canary Decision (After 5 minutes)

```
✅ Canary metrics green? YES
   → Continue to 10% (Early Adopters)

❌ Canary metrics red? NO
   → IMMEDIATE AUTOMATIC ROLLBACK
   → Command: kubectl rollout undo deployment/athlixir-server
   → Notify: Post #incident "Canary rollback initiated"
```

### First 1 Hour (Monitor Continuously)

```bash
# Real-time error tracking
tail -f /var/log/athlixir/error.log | grep -v "404"

# Real-time user activity
curl -s http://localhost:3001/api/metrics/active-users

# Real-time API performance
curl -s http://localhost:3001/api/metrics/api-latency | jq '.p95'

# Check for memory leaks
kubectl top pod -l app=athlixir-server --containers
```

### First 24 Hours (Regular Checks)

```
Every 1 hour:
  [ ] Check error logs - any critical errors?
  [ ] Check user feedback - any complaints?
  [ ] Check performance - still within SLA?
  [ ] Check infrastructure - resource utilization normal?

Every 4 hours:
  [ ] Run security scan
  [ ] Check database backups
  [ ] Verify no data corruption
  [ ] Check analytics data

Every 8 hours:
  [ ] Full system health check
  [ ] Performance report
  [ ] User satisfaction check
```

---

## POST-LAUNCH VERIFICATION

### Immediately After (Within 1 Hour)

```bash
# ✅ Production data validation
curl -H "Authorization: Bearer $PROD_TOKEN" \
  https://api.athlixir.com/api/users/me

# ✅ Video analysis working
# Upload test video and verify processing

# ✅ AI insights working
# Request AI analysis and verify response

# ✅ Email services working
# Trigger password reset and check email

# ✅ Database replication
gcloud sql instances list | grep athlixir-prod

# Expected: Replication status OK
```

### First 24 Hours Checklist

```
Hour 1:
  [ ] No critical errors in logs
  [ ] Response times < 500ms
  [ ] Error rate < 0.1%
  [ ] Users successfully logging in
  [ ] Videos processing without errors

Hour 4:
  [ ] 50+ videos analyzed successfully
  [ ] 100+ users have logged in
  [ ] No data loss
  [ ] Performance metrics stable

Hour 12:
  [ ] 200+ videos processed
  [ ] 500+ unique users
  [ ] No scaling issues
  [ ] AI accuracy normal

Hour 24:
  [ ] 1000+ videos processed
  [ ] 2000+ active users
  [ ] System stable and performing well
  [ ] User feedback positive
```

### First 7 Days Checklist

```
Daily (7:00 AM):
  [ ] Review yesterday's logs
  [ ] Check error trends
  [ ] Review user feedback
  [ ] Verify backups completed

Daily (5:00 PM):
  [ ] Performance report
  [ ] Scaling metrics
  [ ] Security incidents (none expected)
  [ ] Feature adoption rates

Weekly (Friday):
  [ ] Comprehensive health report
  [ ] Performance optimization opportunities
  [ ] High-priority fixes
  [ ] Plan for next week
```

---

## ROLLBACK VERIFICATION

**If rollback is needed:**

### Automatic Rollback Verification

```bash
# ✅ Verify rollback happened
kubectl rollout history deployment/athlixir-server

# ✅ Verify new version no longer running
kubectl get deployment athlixir-server -o wide

# ✅ Verify previous version running
kubectl describe pod <pod-name> | grep "Image:"

# ✅ Verify traffic routing to old version
curl https://api.athlixir.com/api/version
# Expected: previous version number

# ✅ Verify database unchanged
# Previous version should work with existing database
```

### Manual Rollback Verification

```bash
# If automatic rollback fails:

# 1. Scale down new version
kubectl scale deployment athlixir-server --replicas=0

# 2. Verify scaled down
kubectl get pods | grep athlixir-server

# Expected: No pods running

# 3. Restore from backup if needed
gcloud sql backups restore <backup-id> --backup-instance=athlixir-prod

# 4. Verify old version deployable
docker pull athlixir-server:previous-version
docker run ... (verify it works)

# 5. Deploy old version
kubectl set image deployment/athlixir-server athlixir-server=athlixir-server:previous-version

# 6. Verify running
kubectl get pods | grep athlixir-server

# Expected: Pods running
```

---

## SUCCESS CRITERIA

Launch is **SUCCESSFUL** when:

```
✅ Error rate < 0.1% for first hour
✅ Response time p95 < 500ms
✅ No critical vulnerabilities found
✅ All 5 smoke tests passing
✅ No data loss
✅ Users successfully logging in
✅ Video analysis working
✅ AI insights generating
✅ No unresolved incidents
✅ Performance exceeds SLA
✅ Team confidence: 100%
```

---

## ESCALATION PROCEDURES

### Critical Issue Detected

**Severity: CRITICAL**

```
1. IMMEDIATE ACTION
   [ ] Post in #incidents: "CRITICAL ISSUE - [description]"
   [ ] Page on-call engineer: pagerduty.com
   [ ] Assemble incident team (5-10 people)
   [ ] Incident commander takes lead

2. INVESTIGATE (< 5 minutes)
   [ ] Reproduce issue
   [ ] Check error logs
   [ ] Check metrics
   [ ] Check user reports

3. DECISION (< 10 minutes)
   [ ] Can we fix it in <5 minutes? YES → Fix
   [ ] Can we fix it in <5 minutes? NO → Rollback

4. ROLLBACK (if needed)
   [ ] Initiate rollback
   [ ] Verify previous version running
   [ ] Verify issue resolved
   [ ] Notify stakeholders

5. POST-INCIDENT
   [ ] Root cause analysis
   [ ] Preventive measures
   [ ] Documentation
   [ ] Team debrief
```

---

**Test execution log path**: `/logs/test-execution/test-*.log`  
**Deployment timestamp**: Will be filled on launch day  
**Rollback decision**: Will be documented in incident report

