# 🚨 INCIDENT RESPONSE PLAYBOOK

**Critical Scenarios and Response Procedures**

---

## INCIDENT TYPES & RESPONSE PROCEDURES

### 1. HIGH ERROR RATE (>5%)

**Severity**: CRITICAL  
**Detection**: Automatic alert triggered  
**Response Time**: < 5 minutes

#### Symptoms

```
- Error rate > 5% for 1+ minutes
- Many HTTP 500 responses
- Users reporting "something went wrong"
- Alert fires in #incidents Slack channel
```

#### Response Checklist

```
[ ] 1. ACKNOWLEDGE ALERT
    Time: _______
    Responder: _______
    Action: React with 👀 in Slack

[ ] 2. DIAGNOSE (Next 2-3 minutes)
    Check:
    [ ] kubectl logs deployment/athlixir-server | tail -50
    [ ] Grep for "ERROR" in last 100 logs
    [ ] Check which endpoints are failing
    [ ] Check database connectivity
    [ ] Check external service calls (Firebase, etc)

[ ] 3. IDENTIFY PATTERN (Next 2-3 minutes)
    Questions:
    [ ] When did it start? (timestamp from logs)
    [ ] What changed? (New deployment? Code change?)
    [ ] Which endpoint(s) affected?
    [ ] Is database responding?
    [ ] Are external services up?

[ ] 4. QUICK FIXES (Try these first - < 5 min each)
    [ ] Restart pods: kubectl rollout restart deployment/athlixir-server
    [ ] Clear cache: redis-cli FLUSHALL
    [ ] Check database connections: SELECT count(*) FROM pg_stat_activity;
    [ ] Check disk space: df -h
    [ ] Check recent logs for patterns
```

#### Decision Tree

```
Has error rate > 5% for > 1 minute?
  ├─ YES → Continue troubleshooting
  │   ├─ Last deployment < 5 min ago?
  │   │   ├─ YES → ROLLBACK IMMEDIATELY
  │   │   └─ NO → Continue diagnosis
  │   ├─ Database unreachable?
  │   │   ├─ YES → Failover to replica / Restore from backup
  │   │   └─ NO → Continue
  │   ├─ External service (Firebase) down?
  │   │   ├─ YES → Circuit breaker / Feature flag to disable
  │   │   └─ NO → Continue
  │   ├─ Obvious code bug in logs?
  │   │   ├─ YES → Hotfix and deploy
  │   │   └─ NO → ROLLBACK PREVIOUS DEPLOYMENT
  │   └─ Issue unresolved after 15 minutes?
  │       ├─ YES → ROLLBACK TO PREVIOUS VERSION
  └─ NO → Check again in 30 seconds
```

#### Rollback Decision

```
Time to Fix (Estimated) vs Error Rate:
┌────────────────────────────────────────┐
│ Error Rate │ < 5 min │ 5-15 min │ > 15m│
├────────────┼─────────┼──────────┼─────┤
│ > 10%      │ Rollback│ Rollback │ RB*2│
│ 5-10%      │ Fix/RB  │ Rollback │ RB*2│
│ < 5%       │ Fix     │ Fix      │ RB  │
└────────────────────────────────────────┘

RB*2 = Rollback + investigate + prevent
```

#### After Resolution

```
[ ] Error rate back to < 0.1%? YES → RESOLVED
[ ] Post in #incidents: "✅ Issue resolved at HH:MM"
[ ] Create GitHub issue: "Incident: [title] - [timestamp]"
[ ] Schedule post-mortem within 24 hours
[ ] Prevent: Add monitoring / circuit breaker / rate limiting
```

---

### 2. DATABASE UNAVAILABLE

**Severity**: CRITICAL  
**Detection**: Automatic alert  
**Response Time**: < 2 minutes

#### Immediate Response

```
[ ] 1. VERIFY DATABASE IS DOWN
    Command: psql -h $DB_HOST -U postgres -d postgres -c "SELECT 1;"
    Expected: Connection refused OR timeout

[ ] 2. CHECK FIREWALL / NETWORK
    Command: ping $DB_HOST
    Command: telnet $DB_HOST 5432
    Expected: Either works or confirms network issue

[ ] 3. IF NETWORK OK, RESTART DATABASE
    Command: gcloud sql instances restart athlixir-prod
    OR locally: docker-compose restart postgres
    Wait: 30-60 seconds for recovery

[ ] 4. VERIFY RECOVERY
    Command: psql -h $DB_HOST -U postgres -d postgres -c "SELECT 1;"
    Expected: Should return "1"

[ ] 5. IF RESTART FAILS, RESTORE FROM BACKUP
    [ ] Identify last good backup: gcloud sql backups list --instance=athlixir-prod
    [ ] Create new instance from backup
    [ ] Switch CNAME to new instance
    [ ] Verify all data present
```

#### Failover to Replica

```
[ ] 1. Promote read replica to primary
    Command: gcloud sql instances promote-replica athlixir-prod-replica
    Wait: 2-5 minutes

[ ] 2. Update connection string
    Update: $DATABASE_URL in env
    Restart: kubectl rollout restart deployment/athlixir-server

[ ] 3. Verify read-write working
    Test: Can create/update/delete records?

[ ] 4. Repair original primary
    Investigate: Why did it fail?
    Fix: Rebuild from backup / disk space / connection issues?
```

---

### 3. HIGH LATENCY (p95 > 2 seconds)

**Severity**: HIGH  
**Detection**: Alerting  
**Response Time**: < 10 minutes

#### Diagnosis

```
[ ] 1. WHICH ENDPOINTS SLOW?
    Check: Grafana → API latency by endpoint
    Look for: Endpoints with > 2s latency

[ ] 2. DATABASE OR APPLICATION?
    Check: Database query latency
    Command: SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;
    If DB queries fast: Problem is app logic

[ ] 3. EXTERNAL SERVICE CALL?
    Check: Any HTTP calls to Firebase, Stripe, etc
    Test: Time each external call
    If external service slow: Increase timeout / add circuit breaker

[ ] 4. MEMORY LEAK OR GC PAUSE?
    Check: Memory usage trend
    Check: GC pause time
    If increasing: Potential memory leak
```

#### Quick Fixes

```
[ ] Clear cache: redis-cli FLUSHALL
[ ] Add database indexes: CREATE INDEX idx_name ON table(column);
[ ] Optimize slow query: EXPLAIN ANALYZE <query>
[ ] Increase connection pool size
[ ] Scale horizontal: kubectl scale deployment athlixir-server --replicas=5
[ ] Scale vertical: Upgrade node memory/CPU
```

#### Query Optimization

```
For slow query:
1. Get execution plan: EXPLAIN ANALYZE <query>;
2. Check for sequential scan (bad): "Seq Scan"
3. Add index: CREATE INDEX idx_column ON table(column);
4. Verify new plan uses index
5. Test latency again
```

---

### 4. MEMORY LEAK / OUT OF MEMORY

**Severity**: CRITICAL (if affecting production)  
**Detection**: Memory usage trending up  
**Response Time**: < 15 minutes

#### Diagnosis

```
[ ] 1. CONFIRM MEMORY LEAK
    Check: kubectl top pod <pod-name>
    Memory increasing without decrease? → Memory leak
    Memory cyclic (increase then decrease)? → Normal GC

[ ] 2. IDENTIFY COMPONENT
    Check: Which pod using most memory?
    Check: Which endpoint causing memory growth?
    Check: Recent code changes?

[ ] 3. QUICK FIX (Temporary)
    [ ] Restart pod: kubectl delete pod <pod-name>
    [ ] Scale down problematic pod
    [ ] Route traffic to other pods
    [ ] Memory freed up? YES → Confirms memory leak

[ ] 4. ROOT CAUSE
    Check: Unreleased event listeners?
    Check: Accumulating data structures?
    Check: Database connection not closing?
    Check: Cache growing unbounded?
```

#### Immediate Response

```
If Out of Memory Killer (OOM) happening:
  1. Increase pod memory limit: kubectl edit deployment athlixir-server
  2. Change: resources.limits.memory: "2Gi" → "4Gi"
  3. Restart deployment: kubectl rollout restart deployment/athlixir-server
  4. Create GitHub issue for proper fix
```

#### Code Investigation

```bash
# Heap dump
node --inspect=0.0.0.0:9229 server.js

# Connect with DevTools
chrome://inspect

# Track memory over time
node --expose-gc script.js

# Check for leaks
# In DevTools Memory tab:
# 1. Take heap snapshot
# 2. Do operations
# 3. Take another snapshot
# 4. Compare → Look for growing objects
```

---

### 5. AUTHENTICATION BROKEN

**Severity**: CRITICAL  
**Detection**: Login failures > 10%  
**Response Time**: < 5 minutes

#### Symptoms

```
- Users cannot login
- JWT validation failing
- Password reset not working
- Session tokens expired prematurely
- API returning 401 Unauthorized for valid tokens
```

#### Response

```
[ ] 1. DIAGNOSE
    [ ] Is JWT_SECRET still valid?
    [ ] Did something change in auth service?
    [ ] Can you manually verify a token?
    Command: jwt.verify(token, process.env.JWT_SECRET)

[ ] 2. COMMON CAUSES
    [ ] JWT_SECRET changed in environment → Update it back
    [ ] Firebase credentials expired → Update them
    [ ] Clock skew between servers → Sync NTP
    [ ] Token expiration too short → Check token TTL

[ ] 3. QUICK TESTS
    [ ] Can you create a token?
    [ ] Can you verify the token?
    [ ] Does it work from another server?
    [ ] Are timestamps correct?

[ ] 4. ROLLBACK AUTH CHANGES
    If recent deployment changed auth logic:
    kubectl rollout undo deployment/athlixir-server
    This should restore previous auth behavior
```

#### Preventing Lockout

```
If ALL auth is broken:
  1. You have a grace period (users can't login)
  2. Deploy hotfix to bypass auth temporarily
  3. OR restore from backup with old auth code
  4. Fix auth logic
  5. Redeploy with working auth
```

---

### 6. DISK SPACE CRITICAL (< 5%)

**Severity**: HIGH → CRITICAL  
**Detection**: Alert fired  
**Response Time**: < 10 minutes

#### Immediate Response

```
[ ] 1. IDENTIFY WHAT'S USING SPACE
    Commands:
    du -sh /* | sort -hr
    du -sh /var/log/* | sort -hr
    du -sh /var/cache/* | sort -hr

[ ] 2. DELETE OLD LOGS (Usually safe)
    find /var/log -type f -name "*.log" -mtime +30 -delete
    This removes logs older than 30 days

[ ] 3. CLEAN DOCKER IMAGES (Usually safe)
    docker system prune -a

[ ] 4. CLEAN TEMPORARY FILES
    rm -rf /tmp/*
    rm -rf ~/.cache/*

[ ] 5. CHECK DATABASE BLOAT
    SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;
    VACUUM FULL; (Optional, takes time)

[ ] 6. EXPAND DISK
    While temporary fixes run:
    [ ] In cloud provider, increase volume size
    [ ] Remount with new size
    [ ] Verify with: df -h
```

#### Long-Term

```
[ ] Implement log rotation: logrotate
[ ] Delete old backups: Only keep 7-14 days
[ ] Monitor disk usage: Alert at 70%, 80%, 90%
[ ] Implement cleanup jobs: Automated deletion of old records
```

---

### 7. EXTERNAL SERVICE UNAVAILABLE

**Severity**: HIGH (or lower, depending on service)  
**Detection**: Timeouts or failures calling Firebase, Stripe, etc  
**Response Time**: < 10 minutes

#### Response by Service

**Firebase Down:**
```
[ ] 1. Verify with: curl https://www.google-status.com/
[ ] 2. If really down: Use circuit breaker
    Code: Stop calling Firebase for a period
    Show user: "Service temporarily unavailable, retry later"
[ ] 3. If network issue: Check connectivity
    ping firebase.google.com
[ ] 4. Check credentials not expired
    gcloud auth login
    gcloud auth application-default login
```

**Stripe/Payment Service Down:**
```
[ ] 1. Stop processing payments
[ ] 2. Queue payment requests
[ ] 3. Notify users: "Payments temporarily unavailable"
[ ] 4. Retry when service recovers
[ ] 5. Check status page: stripe.com/status
```

**Email Service Down:**
```
[ ] 1. Queue emails to send later
[ ] 2. Check email logs: Was it actually sent?
[ ] 3. Retry: Background job to resend queued emails
[ ] 4. Monitor for recovery
```

---

### 8. DEPLOYMENT FAILURE

**Severity**: HIGH  
**Detection**: Pod crash loop / Application won't start  
**Response Time**: < 5 minutes

#### Response

```
[ ] 1. IMMEDIATE: REVERT DEPLOYMENT
    Command: kubectl rollout undo deployment/athlixir-server
    Wait for: Pods to restart with previous version

[ ] 2. VERIFY REVERT WORKED
    Command: kubectl get pods
    Expected: Pods should be Running

[ ] 3. TEST FUNCTIONALITY
    curl http://localhost:3001/api/health
    Expected: 200 OK

[ ] 4. POST-REVERT INVESTIGATION
    [ ] Check what was deployed: git log -1
    [ ] Check pod logs: kubectl logs <pod-name>
    [ ] Fix issue locally
    [ ] Deploy again with fix

[ ] 5. PREVENT FUTURE
    [ ] Add pre-deployment health check
    [ ] Add canary testing (deploy to 1% first)
    [ ] Add automated rollback on health check failure
```

---

### 9. DATA CORRUPTION / INTEGRITY ISSUE

**Severity**: CRITICAL  
**Detection**: Inconsistent data / Queries returning wrong results  
**Response Time**: < 10 minutes

#### Immediate Action

```
[ ] 1. CONFIRM CORRUPTION
    [ ] Manually verify data in database
    [ ] Check: Are foreign keys broken?
    [ ] Check: Are totals mismatched?

[ ] 2. PREVENT FURTHER DAMAGE
    [ ] Stop writes to affected table: LOCK TABLE table_name;
    [ ] CHECKPOINT application: Stop receiving requests for this table
    [ ] DO NOT DELETE DATA YET

[ ] 3. RESTORE FROM BACKUP
    [ ] Get backup timestamp from before corruption
    [ ] Restore to point-in-time: gcloud sql backups restore <backup-id>
    [ ] Create new instance from backup
    [ ] Run integrity checks on new instance
    [ ] Switch to restored instance
    [ ] Users need to re-do operations since backup time
```

#### Investigation

```
[ ] When did corruption occur?
[ ] What changed around that time?
[ ] Was it code change / concurrent write / race condition?
[ ] How to prevent?
    - Add unique constraints?
    - Improve transaction handling?
    - Add checksums?
    - Add validation?
```

---

### 10. CERTIFICATE EXPIRATION

**Severity**: HIGH → CRITICAL  
**Detection**: Alert 30 days before / User sees SSL error  
**Response Time**: < 30 minutes

#### Response

```
[ ] 1. IF CERTIFICATE EXPIRED
    Users see: "SEC_ERROR_UNKNOWN_ISSUER" or similar

[ ] 2. RENEW CERTIFICATE
    If using Let's Encrypt:
    certbot renew
    
    If using CloudFlare:
    Check dashboard for renewal option

[ ] 3. RESTART SERVICES
    kubectl rollout restart deployment/athlixir-server

[ ] 4. VERIFY CERTIFICATE VALID
    openssl s_client -connect api.athlixir.com:443 -showcerts
    Check: Not Expired date
```

#### Prevention

```
[ ] Set renewal reminders: 60 days, 30 days, 7 days before expiration
[ ] Automate renewal: Let's Encrypt auto-renewal
[ ] Monitor certificate expiration: Prometheus alert
[ ] Alert threshold: Page if expiring within 7 days
```

---

## INCIDENT SEVERITY MATRIX

| Severity | Impact | Response Time | Decision Level |
|----------|--------|---|---|
| **P1/CRITICAL** | Service down / Users affected | < 5 min | On-call engineer → auto page |
| **P2/HIGH** | Degraded service / Feature broken | < 15 min | On-call engineer → manual page |
| **P3/MEDIUM** | Minor impact / Non-critical | < 1 hour | Create ticket |
| **P4/LOW** | No impact / Future improvement | Next sprint | Create GitHub issue |

---

## COMMUNICATION DURING INCIDENT

### Status Updates

```
Timeline:
0 min - Alert fires
1 min - "Investigating issue with [service]"
5 min - "Issue identified: [brief description]"
10 min - "Fix in progress" OR "Rolling back deployment"
15 min - "Issue should be resolved, verifying"
20 min - "✅ Issue resolved. Investigating root cause"

Template:
Time: HH:MM UTC
Status: INVESTIGATING / IN PROGRESS / RESOLVED
Impact: [Users affected / Services down / Rate affected]
ETA: [Estimated time to fix / Estimated time to next update]
```

### Channels

```
#incidents          - Real-time incident discussion
@eng-oncall         - Notify on-call engineer
@pagerduty          - For critical issues
#general            - Summary after resolution
status.athlixir.com - Public status page (if applicable)
```

---

## POST-INCIDENT ACTIONS

### Incident Report Template

```markdown
# Incident Report: [Incident Name]

## Summary
[1-2 sentence description]

## Timeline
- HH:MM - Alert triggered
- HH:MM - Issue identified
- HH:MM - Fix implemented
- HH:MM - Issue resolved

## Impact
- Duration: [minutes]
- Users affected: [number]
- Errors: [number]
- Revenue impact: [if applicable]

## Root Cause
[What actually went wrong]

## Resolution
[How we fixed it]

## Prevention
[How to prevent next time]

## Action Items
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3
```

### Postmortem Meeting (within 24 hours)

```
Attendees: On-call engineer, tech lead, product, relevant team members

Agenda:
  1. What happened? (5 min)
  2. Why did it happen? (10 min)
  3. What could we have done better? (10 min)
  4. What changes to make? (10 min)
  5. Action items and owners (5 min)

Output:
  - Root cause identified
  - 1-3 preventive measures planned
  - Action items assigned with due dates
  - Timeline for implementation
```

---

## RUNBOOK QUICK REFERENCE

| Issue | Quick Fix | Escalate If |
|-------|-----------|---|
| High Error Rate | Restart pod | Persist after restart |
| High Latency | Scale horizontally | Persist after scaling |
| Database Down | Check connectivity | Can't connect within 2 min |
| OOM Error | Restart pod | Recurs within 10 min |
| Auth Broken | Rollback auth changes | Manual fix needed |
| Disk Full | Clean logs | Can't free enough space |
| External Down | Use circuit breaker | Service stays down 30+ min |

---

**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]  
**Team Training**: [Required before production launch]

