# CRITICAL FIXES - Action Items

## 🔴 SEVERITY 1: MUST FIX (Security Issues)

### 1. Remove Hardcoded Secret from docker-compose.yml
**Location**: `docker-compose.yml` lines 20, 40
**Current**:
```yaml
- INTERNAL_API_SECRET=a-very-secret-and-long-key-for-internal-service-auth
```

**Fix**:
```yaml
- INTERNAL_API_SECRET=${INTERNAL_API_SECRET}
```

Then create `.env` file (add to .gitignore):
```env
INTERNAL_API_SECRET=your-actual-secret-key-here
```

**Why**: Secrets in version control are a major security breach.

---

### 2. Fix Signed URL Expiration
**Location**: `server/src/modules/analysis/services/analysis.service.ts` line 169
**Current**:
```typescript
const [signedUrl] = await storageFile.getSignedUrl({
  action: 'read',
  expires: '03-09-2491',  // ❌ Year 2491!
});
```

**Fix**:
```typescript
const [signedUrl] = await storageFile.getSignedUrl({
  action: 'read',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24 hours
});
```

**Why**: Current expiration is practically permanent, defeats security purpose.

---

### 3. Implement Structured Logging
**Location**: `ai-engine/app/api/analyze.py` (20+ locations)
**Current**:
```python
print(f"[AI PIPELINE ERR] {err}")  # ❌ Goes to stdout, lost after container restart
```

**Fix**:
Create `ai-engine/app/logging_config.py`:
```python
import logging
import json
from pythonjsonlogger import jsonlogger

def setup_logging():
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter()
    logHandler.setFormatter(formatter)
    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)
    return logger

logger = setup_logging()
```

Then update `ai-engine/requirements.txt`:
```
python-json-logger
```

And replace all `print()` calls:
```python
logger.error(f"Analysis failed for {analysis_id}", exc_info=True, extra={
    "userId": user_id,
    "videoUrl": video_url[:50],
    "stage": "PROCESSING_POSE"
})
```

**Why**: Print statements are lost, making debugging impossible in production.

---

## 🟡 SEVERITY 2: SHOULD FIX (Stability)

### 4. Add Rate Limiting to Upload Endpoint
**Location**: `server/src/modules/analysis/controllers/analysis.controller.ts` line 27
**Current**: No rate limiting

**Fix**: Install throttler
```bash
npm install @nestjs/throttler
```

Add to `app.module.ts`:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,      // 1 minute window
      limit: 5,        // 5 requests per minute
    }]),
  ],
})
export class AppModule {}
```

Apply to controller:
```typescript
import { Throttle } from '@nestjs/throttler';

@Post('upload')
@Throttle({ default: { limit: 5, ttl: 60000 } })
@UseGuards(FirebaseAuthGuard)
async uploadVideo(@CurrentUser() user: any, @UploadedFile() file: any) {
  // ... existing code
}
```

**Why**: Prevents resource exhaustion attacks and accidental DoS.

---

### 5. Fix Video Cache Memory Leak
**Location**: `server/src/modules/analysis/services/analysis.service.ts` line 206-213
**Current**:
```typescript
private cachePendingVideo(analysisId: string, file: { buffer: Buffer; mimetype: string }) {
  this.pendingVideos.set(analysisId, {
    buffer: file.buffer,
    mimetype: file.mimetype,
    expiresAt: Date.now() + 60 * 60 * 1000,  // 1 hour
  });
}
```

**Issue**: Map grows unbounded, no cleanup if expiration passes

**Fix**:
```typescript
private readonly pendingVideos = new Map<string, PendingVideo>();
private videoCacheCleanupInterval: NodeJS.Timeout;

constructor(...) {
  // ... existing code
  
  // Clean up expired videos every 5 minutes
  this.videoCacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, video] of this.pendingVideos.entries()) {
      if (now > video.expiresAt) {
        this.pendingVideos.delete(key);
        this.logger.log(`Cleaned up cached video: ${key}`);
      }
    }
  }, 5 * 60 * 1000);
}

onModuleDestroy() {
  if (this.videoCacheCleanupInterval) {
    clearInterval(this.videoCacheCleanupInterval);
  }
}
```

**Why**: Prevents memory leaks in long-running processes.

---

### 6. Add Error Context to Callbacks
**Location**: `server/src/modules/analysis/services/analysis.service.ts` line 139-141
**Current**:
```typescript
this.triggerPythonEngine(analysisId, signedUrl, userId).catch((err) => {
  this.logger.error(`AI dispatch failed for ${analysisId}`, err);
});
```

**Fix**:
```typescript
this.triggerPythonEngine(analysisId, signedUrl, userId).catch((err) => {
  this.logger.error(`AI dispatch failed for ${analysisId}`, {
    error: err.message,
    stack: err.stack,
    userId,
    analysisId,
  });
  
  // Update status so client knows it failed
  await this.updateStatus(analysisId, 'FAILED', 0, {
    errorMessage: 'Failed to trigger analysis engine',
  }).catch(() => {
    this.logger.error(`Failed to update status for failed dispatch: ${analysisId}`);
  });
});
```

**Why**: Ensures client is informed of failures, not left hanging.

---

## 🟢 MEDIUM PRIORITY: NICE TO HAVE (Scale)

### 7. Scale FastAPI with Gunicorn
**Location**: `ai-engine/start.sh`
**Current**:
```bash
#!/bin/bash
cd /app && python -m app.main
```

**Fix**:
```bash
#!/bin/bash
cd /app
gunicorn -w 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --access-logfile - \
  --error-logfile - \
  app.main:app
```

Update requirements.txt:
```
gunicorn
uvicorn[standard]
```

**Why**: 4 workers can handle 4x more concurrent requests.

---

### 8. Setup Redis Adapter for WebSocket Scaling
**Location**: `server/src/modules/analysis/gateways/analysis.gateway.ts`

**Current**: Single instance only

**Fix**:
```bash
npm install @socket.io/redis-adapter
```

Update gateway:
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import * as IORedis from 'ioredis';

export class AnalysisGateway implements OnGatewayInit {
  private pubClient: IORedis.Redis;
  private subClient: IORedis.Redis;

  constructor(private logger: Logger) {
    this.pubClient = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.subClient = this.pubClient.duplicate();
  }

  afterInit(server: Server) {
    server.adapter(createAdapter(this.pubClient, this.subClient));
  }
}
```

**Why**: Allows WebSocket to work across multiple server instances.

---

### 9. Add Comprehensive Input Validation
**Location**: `server/src/modules/analysis/controllers/analysis.controller.ts` line 45-49
**Current**:
```typescript
async uploadVideo(@CurrentUser() user: any, @UploadedFile() file: any) {
  if (!file) {
    throw new BadRequestException('No video file selected for analysis.');
  }
  return this.analysisService.uploadAndAnalyze(user.uid, file);
}
```

**Fix**:
```typescript
async uploadVideo(
  @CurrentUser() user: any,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: '(video/mp4|video/quicktime|video/x-msvideo)' }),
        new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }),
      ],
    }),
  ) file: Express.Multer.File,
) {
  // Validate duration (should be 2-30 seconds for sprint analysis)
  const duration = await getVideoDuration(file.buffer);
  if (duration < 1 || duration > 30) {
    throw new BadRequestException('Video must be between 1 and 30 seconds');
  }
  
  return this.analysisService.uploadAndAnalyze(user.uid, file);
}

async function getVideoDuration(buffer: Buffer): Promise<number> {
  // Use ffprobe or mediainfo to validate
  // Or skip validation and let AI engine fail gracefully
}
```

**Why**: Prevents invalid videos from clogging the processing queue.

---

## Implementation Timeline

### This Week (Days 1-3)
- [ ] Fix #1: Remove hardcoded secrets
- [ ] Fix #2: Signed URL expiration
- [ ] Fix #3: Structured logging

### This Sprint (Days 4-7)
- [ ] Fix #4: Rate limiting
- [ ] Fix #5: Video cache cleanup
- [ ] Fix #6: Error context

### Next Sprint (Days 8-14)
- [ ] Fix #7: Gunicorn scaling
- [ ] Fix #8: Redis adapter
- [ ] Fix #9: Input validation
- [ ] Add unit tests (>80% coverage)
- [ ] Setup error monitoring (Sentry)

---

## Verification

After implementing fixes, verify with:

```bash
# Check logs are structured JSON
docker logs athlixir-ai-engine | jq .

# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3001/api/analysis/upload; done

# Monitor memory usage
docker stats athlixir-ai-engine

# Check signed URL expiration
curl -I "$(grep -oP 'https://[^"]*' signed_url.txt)"
```

---

**Total Effort**: ~15-20 hours for a team of 2 engineers
**Security Impact**: Prevents major security breaches
**Performance Impact**: 4x throughput improvement
