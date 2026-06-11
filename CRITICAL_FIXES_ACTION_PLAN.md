# 🔴 CRITICAL FIXES - ACTION PLAN (4 HOURS)

**Status**: Must complete BEFORE any production launch  
**Time**: 4 hours maximum  
**Team**: 1-2 developers  

---

## TASK 1: Remove Simulation Pipeline (5 minutes)

**File**: `server/src/modules/analysis/services/analysis.service.ts`  
**Action**: DELETE lines 950-1053

```bash
# Verify what you're deleting
grep -n "simulateAnalysisPipeline" server/src/modules/analysis/services/analysis.service.ts
# Should show: 950:  private simulateAnalysisPipeline(analysisId: string) {
```

**Steps**:
1. Open the file
2. Select lines 950-1053 entirely
3. Delete the function
4. Save
5. Verify no other references:
   ```bash
   grep -r "simulateAnalysisPipeline" server/src --include="*.ts"
   # Should return NOTHING if fully deleted
   ```

✅ **Verification**: Compile succeeds with no warnings

---

## TASK 2: Fix SameSite Cookie (10 minutes)

**File**: `server/src/auth/controllers/auth.controller.ts`  
**Locations**: Lines 57, 98, 145, 161

**Find**: 
```typescript
sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
```

**Replace with**:
```typescript
sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
```

**Steps**:
1. Open file
2. Find & Replace (Ctrl+H or Cmd+H)
3. Find: `? 'none' : 'lax'`
4. Replace: `? 'strict' : 'lax'`
5. Click "Replace All" (should find 4 occurrences)
6. Save

✅ **Verification**: 
```bash
grep "sameSite.*'none'" server/src/auth/controllers/auth.controller.ts
# Should return NOTHING
```

---

## TASK 3: Add Password Visibility Toggle (30 minutes)

**File 1**: `client/app/login/page.tsx`

**Step 1**: Add import
```typescript
import { Eye, EyeOff } from 'lucide-react';  // ADD THIS
```

**Step 2**: Add state (after line 13)
```typescript
const [showPassword, setShowPassword] = useState(false);  // ADD
```

**Step 3**: Replace password input (lines 114-141)

OLD:
```typescript
<input
  type="password"
  id="password"
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    setError(null);
    setValidationError(null);
  }}
  className="block w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 outline-none transition duration-300 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 focus:bg-white/[0.04] tracking-[0.25em]"
  placeholder="••••••••"
/>
```

NEW:
```typescript
<div className="relative">
  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
    <Lock className="h-4 w-4" />
  </div>
  <input
    type={showPassword ? 'text' : 'password'}
    id="password"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      setError(null);
      setValidationError(null);
    }}
    className="block w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-12 py-3.5 text-xs text-white placeholder-zinc-600 outline-none transition duration-300 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 focus:bg-white/[0.04] tracking-[0.25em]"
    placeholder="••••••••"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-[#FF4F21] transition"
  >
    {showPassword ? (
      <EyeOff className="h-4 w-4" />
    ) : (
      <Eye className="h-4 w-4" />
    )}
  </button>
</div>
```

✅ **Verification**: Toggle shows/hides password in browser

---

## TASK 4: Set Firebase Security Rules (20 minutes)

**Action**: Create file `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can read/write their own analyses
    match /analyses/{analysisId} {
      allow read, write: if resource.data.userId == request.auth.uid;
    }

    // Athlete profiles owned by user
    match /athlete_profiles/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Metrics are read-only for owner, write-only for backend
    match /metrics/{metricId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow write: if false;  // Only backend
    }

    // Same for other collections
    match /scores/{scoreId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    match /reports/{reportId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    match /injury_risks/{riskId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    match /recommendations/{recId} {
      allow read: if resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

**Steps**:
1. Open Firebase Console → Firestore → Rules
2. Copy the content above
3. Click "Publish"
4. Wait for deployment (1-2 minutes)

✅ **Verification**: Try accessing another user's data - should fail with permission denied

---

## TASK 5: Add Security Headers (30 minutes)

**File**: `server/src/main.ts`

**Step 1**: Install helmet
```bash
npm install @nestjs/helmet
```

**Step 2**: Add to imports
```typescript
import helmet from '@nestjs/helmet';
```

**Step 3**: Add to bootstrap function (after NestFactory.create)
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://firestore.googleapis.com"],
        fontSrc: ["'self'", "data:"],
        frameSrc: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  // ... rest of bootstrap
  await app.listen(3001);
}
```

✅ **Verification**: 
```bash
curl -i http://localhost:3001/api/auth/me
# Should see X-Content-Type-Options: nosniff
# Should see X-Frame-Options: DENY
```

---

## TASK 6: Add Video Codec Validation (1 hour)

**File**: `server/src/modules/analysis/services/analysis.service.ts`

**Step 1**: Install ffmpeg
```bash
npm install fluent-ffmpeg
```

**Step 2**: Add method (around line 950, where you deleted simulation)
```typescript
private async validateVideoCodec(buffer: Buffer): Promise<string> {
  const tempFile = join(tmpdir(), `validate-${Date.now()}.tmp`);
  writeFileSync(tempFile, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempFile, (err, metadata) => {
      try {
        unlinkSync(tempFile);
      } catch {}
      
      if (err) {
        reject(new Error('Invalid video file format'));
        return;
      }
      
      const videoStream = metadata.streams?.find(s => s.codec_type === 'video');
      
      if (!videoStream) {
        reject(new Error('No video stream found in file'));
        return;
      }
      
      const validCodecs = ['h264', 'hevc', 'mpeg4'];
      
      if (!validCodecs.includes(videoStream.codec_name || '')) {
        reject(new Error(`Unsupported codec: ${videoStream.codec_name}. Use H.264, HEVC, or MPEG4.`));
        return;
      }
      
      if (!videoStream.width || !videoStream.height) {
        reject(new Error('Video has no resolution'));
        return;
      }
      
      resolve(videoStream.codec_name || 'h264');
    });
  });
}
```

**Step 3**: Call in uploadAndAnalyze (add after line 69, MIME check)
```typescript
const allowedMimeTypes = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
];
if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new BadRequestException(...);
}

// ADD THIS:
try {
  await this.validateVideoCodec(file.buffer);
} catch (err: any) {
  throw new BadRequestException(err.message);
}
```

✅ **Verification**: Upload with wrong codec - should fail with message

---

## TASK 7: Implement Password Reset (2 hours)

**Step 1**: Create controller (see PRODUCTION_AUDIT_REPORT.md CRITICAL #4)

**Step 2**: Create service

**Step 3**: Create forgot-password page

**Step 4**: Create reset-password page

**Complete code** in PRODUCTION_AUDIT_REPORT.md CRITICAL #4

✅ **Verification**: 
1. Go to /forgot-password
2. Enter email
3. Check email for reset link
4. Click link → /reset-password
5. Set new password
6. Login with new password

---

## Testing After Critical Fixes

```bash
# 1. Compile and no errors
npm run build
npm run build  # server

# 2. Start services
docker-compose up -d

# 3. Test each critical fix
curl http://localhost:3001/api/auth/me
# Should get security headers

# 4. Test password visibility
# Open browser, go to /login
# Click eye icon - password should show/hide

# 5. Test Firebase rules
# Try to read another user's data from browser console
# Should get permission denied

# 6. Test password reset
# Go to /forgot-password
# Submit email
# Check for email (if configured)

# 7. Test video upload
# Go to dashboard
# Upload video with wrong codec
# Should fail with error message

# 8. Verify no simulation data returned
# Upload video
# Verify metrics are real (not hardcoded 178, 198, etc)
```

---

## Deployment Command

After all fixes tested locally:

```bash
# Build and deploy
docker-compose down
docker-compose up -d --build

# Verify deployment
curl https://your-domain.com/api/auth/me
# Should see security headers
```

---

## Rollback Plan

If critical issues arise:

```bash
# Restore previous version from git
git checkout HEAD~1

# Stop and rollback
docker-compose down
docker-compose up -d

# Check status
docker logs athlixir-server
```

---

## Sign-Off Checklist

- [ ] Simulation pipeline deleted
- [ ] SameSite cookie fixed
- [ ] Password visibility added to login
- [ ] Password visibility added to signup
- [ ] Firebase rules deployed
- [ ] Security headers added
- [ ] Video codec validation working
- [ ] Password reset pages created
- [ ] All tests passing
- [ ] Local testing complete
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Staging testing complete
- [ ] Ready for production

---

## Timeline

| Task | Time | Owner | Status |
|------|------|-------|--------|
| 1. Remove simulation | 5 min | Dev1 | ⏳ |
| 2. Fix cookie | 10 min | Dev1 | ⏳ |
| 3. Password toggle | 30 min | Dev1 | ⏳ |
| 4. Firebase rules | 20 min | Dev2 | ⏳ |
| 5. Security headers | 30 min | Dev1 | ⏳ |
| 6. Codec validation | 60 min | Dev2 | ⏳ |
| 7. Password reset | 120 min | Dev1 + Dev2 | ⏳ |
| **Testing** | 30 min | QA | ⏳ |
| **TOTAL** | **4h 45m** | - | ⏳ |

---

**Start Time**: [NOW]  
**Target Completion**: 4 hours 45 minutes  
**Status**: Ready to begin  

👉 **NEXT**: Start with Task 1 (easiest, quick win)
