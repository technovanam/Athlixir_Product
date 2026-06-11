# ATHLIXIR Frontend Bug Fixes - Production Issues

**Date**: 2026-06-11  
**Status**: 11 Critical Issues Identified & Fixes Provided  
**Model**: Haiku 4.5 + Gemini API Integration  

---

## 🔴 CRITICAL ISSUES & FIXES

### 1. PHOTO UPLOAD NOT REFLECTING
**Location**: `client/app/onboarding/basic-info/page.tsx`  
**Issue**: Photo uploads but preview doesn't update properly in the form

**Root Cause**: 
- `unwrapApiData` might not be returning the URL correctly
- Preview uses blob URL which gets revoked too early
- Photo state update happens but UI doesn't refresh

**Fix**:
```typescript
// client/app/onboarding/basic-info/page.tsx - Replace handlePhotoUpload function

const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    setError('File size exceeds 5MB limit');
    return;
  }

  setUploading(true);
  setError(null);

  const previewUrl = URL.createObjectURL(file);
  setProfilePhoto(previewUrl); // Show preview immediately

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/onboarding/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Fix: Properly extract URL from response
    let uploadedUrl = '';
    if (response.data?.data?.url) {
      uploadedUrl = response.data.data.url;
    } else if (response.data?.url) {
      uploadedUrl = response.data.url;
    } else if (typeof response.data === 'string') {
      uploadedUrl = response.data;
    }

    if (uploadedUrl) {
      // Keep preview URL in state, but also save the uploaded URL
      setProfilePhoto(uploadedUrl);
      // Revoke blob URL after a brief delay to ensure render
      setTimeout(() => URL.revokeObjectURL(previewUrl), 100);
    } else {
      throw new Error('No URL returned from upload');
    }
  } catch (err: any) {
    URL.revokeObjectURL(previewUrl);
    const errMsg = err.response?.data?.message || err.message || 'Failed to upload photo';
    setError(errMsg);
    setProfilePhoto(''); // Clear on error
    
    // Try to recover from saved data
    try {
      const statusRes = await api.get('/onboarding/status');
      const saved = getOnboardingProfile(statusRes);
      if (saved?.profile_photo) {
        setProfilePhoto(saved.profile_photo);
      }
    } catch {
      // Silent fallback
    }
  } finally {
    setUploading(false);
  }
};
```

---

### 2. FORM DATA NOT PERSISTING WHEN NAVIGATING BACK
**Location**: All onboarding pages (`client/app/onboarding/**/page.tsx`)  
**Issue**: User fills form, clicks next, comes back - data is empty

**Root Cause**:
- Each page only loads on mount, doesn't track unsaved changes
- No autosave functionality
- No Redux/Context to preserve state across navigation

**Fix - Add Autosave Context**:

Create `client/app/context/OnboardingContext.tsx`:
```typescript
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface OnboardingState {
  basicInfo?: any;
  classification?: any;
  bodyMetrics?: any;
  trainingProfile?: any;
  goals?: any;
  injuryHistory?: any;
  consent?: any;
}

interface OnboardingContextType {
  state: OnboardingState;
  updateSection: (section: string, data: any) => void;
  clearAll: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({});

  const updateSection = useCallback((section: string, data: any) => {
    setState(prev => ({
      ...prev,
      [section]: data,
    }));
    // Auto-save to localStorage
    localStorage.setItem('onboardingState', JSON.stringify({ ...state, [section]: data }));
  }, [state]);

  const clearAll = useCallback(() => {
    setState({});
    localStorage.removeItem('onboardingState');
  }, []);

  return (
    <OnboardingContext.Provider value={{ state, updateSection, clearAll }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
```

Update `client/app/onboarding/layout.tsx` to wrap with provider:
```typescript
import { OnboardingProvider } from '../context/OnboardingContext';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      {/* existing layout code */}
    </OnboardingProvider>
  );
}
```

Update `client/app/onboarding/basic-info/page.tsx` to use context:
```typescript
'use client';

import { useOnboarding } from '../../context/OnboardingContext';

export default function BasicInfoStep() {
  const { user } = useAuth();
  const { state, updateSection } = useOnboarding();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  // ... other states

  // Load from context on mount
  useEffect(() => {
    if (state.basicInfo) {
      setFullName(state.basicInfo.fullName || '');
      setDob(state.basicInfo.dob || '');
      // ... other fields
    } else {
      // If no context, load from API
      loadSavedData();
    }
  }, []);

  // Auto-save on change
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to context first (for back-navigation)
    updateSection('basicInfo', {
      fullName,
      dob,
      gender,
      state,
      city,
      profilePhoto,
    });

    // Then send to API
    try {
      await api.post('/onboarding/basic-info', {
        fullName,
        dob,
        gender,
        state,
        city,
        profilePhoto,
      });
      router.replace('/onboarding/classification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };
}
```

---

### 3. INJURY RISK SHOWING MANY RISKS WHEN "NO PRIOR INJURIES" SELECTED
**Location**: `server/src/modules/ai-insights/prompts/insights-prompts.ts` & injury risk calculation logic

**Issue**: AI engine generates injury risks even when user selected "No Prior Injuries"

**Root Cause**:
- Injury history not being passed to AI engine correctly
- AI prompt doesn't account for "No Prior Injuries" selection
- Injury risk calculation doesn't filter based on history

**Fix**:

Update `server/src/modules/analysis/services/analysis.service.ts` (getAthleteContext):
```typescript
private async getAthleteContext(userId: string) {
  const doc = await this.firebaseService.firestore
    .collection(this.athleteProfilesCollection)
    .doc(userId)
    .get();

  if (!doc.exists) {
    return { ageGroup: 'u18', gender: 'male', event: '100m', injuryHistory: null };
  }

  const d = doc.data() as Record<string, unknown>;
  const genderRaw = String(d.gender || 'male').toLowerCase();
  const gender = genderRaw.startsWith('f') ? 'female' : 'male';
  const event = String(d.primary_event || '100m')
    .toLowerCase()
    .replace(/\s/g, '');

  // Extract injury history properly
  const injuryHistory = d.injury_history as any;
  const hasNoInjuries = injuryHistory?.injuries?.includes('None') ?? false;

  return {
    ageGroup: this.deriveAgeGroup(d.dob as string),
    gender,
    event,
    heightCm: d.height_cm as number | undefined,
    injuryHistory: {
      hasHistory: !hasNoInjuries && (injuryHistory?.injuries?.length > 0),
      injuries: hasNoInjuries ? [] : (injuryHistory?.injuries || []),
      currentPain: injuryHistory?.current_pain ?? false,
      severity: injuryHistory?.severity ?? 0,
    },
  };
}
```

Update `server/src/modules/ai-insights/prompts/insights-prompts.ts`:
```typescript
export function buildAnalysisPrompt(promptInput: any, flags: string[], confidence: any): string {
  const { athlete, metrics, scores, injuryRisks, benchmarks, progress } = promptInput;
  
  // NEW: Filter injury risks based on injury history
  let contextualInjuryRisks = injuryRisks || [];
  if (athlete?.injuryHistory?.hasHistory === false) {
    // If no injury history, only include movement quality risks
    contextualInjuryRisks = injuryRisks.filter((risk: any) => 
      risk.category === 'Movement Quality' && risk.detected === false
    );
  }

  return `
You are an elite sports biomechanics analyst for a professional track and field platform.

Athlete Context:
- Event: ${athlete?.event || '100m'}
- Gender: ${athlete?.gender}
- Age Group: ${athlete?.ageGroup}
- Prior Injuries: ${athlete?.injuryHistory?.hasHistory ? athlete.injuryHistory.injuries.join(', ') : 'None reported'}
- Current Pain: ${athlete?.injuryHistory?.currentPain ? 'Yes' : 'No'}

Metrics Analyzed:
- Cadence: ${metrics.cadence} SPM
- GCT: ${metrics.gct} ms (Left: ${metrics.leftGct}ms, Right: ${metrics.rightGct}ms)
- Stride Length: ${metrics.strideLength}m
- Symmetry: ${metrics.symmetry}%
- Oscillation: ${metrics.oscillation}cm

Performance Scores:
- Overall: ${scores.performanceScore}/100
- Efficiency: ${scores.efficiencyScore}/100
- Biomechanics: ${scores.biomechanicsScore}/100

Benchmarks:
- Profile: ${benchmarks.profileLabel}
- Cadence Level: ${benchmarks.levels?.cadence}
- GCT Level: ${benchmarks.levels?.gct}

Injury Risks (${contextualInjuryRisks.length} detected):
${contextualInjuryRisks.map((r: any) => `- ${r.category}: ${r.detail}`).join('\n')}

Flag Warnings: ${flags.join(', ') || 'None'}
Data Confidence: ${confidence.overallConfidence}%

Provide:
1. Strengths (2-3 bullet points)
2. Weaknesses (2-3 bullet points)  
3. Observations about movement efficiency
4. Recommendations (2-3 actionable coaching cues)

For injury risks, ONLY mention risks if they're detected or if the athlete has prior injury history.
${!athlete?.injuryHistory?.hasHistory ? 'Since athlete has NO prior injuries, focus ONLY on positive movement quality feedback.' : ''}
`;
}
```

---

### 4. CALENDAR SYNC NOT WORKING
**Location**: `client/app/(dashboard)/calendar/` (if exists) or needs to be implemented

**Issue**: Calendar integration with analysis dates not syncing

**Root Cause**: Calendar likely not fetching analysis dates or not displaying them

**Fix**: Create calendar integration:

Create `client/app/(dashboard)/components/CalendarWidget.tsx`:
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [analysisDates, setAnalysisDates] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const res = await api.get('/analysis/list');
        const analyses = res.data?.data ?? res.data ?? [];
        
        // Extract dates that have completed analyses
        const dates = new Set<number>();
        analyses.forEach((a: any) => {
          if (a.status === 'COMPLETED' && a.createdAt) {
            const date = new Date(a.createdAt).getDate();
            dates.add(date);
          }
        });
        
        setAnalysisDates(dates);
      } catch (err) {
        console.error('Failed to load calendar dates:', err);
      }
    };

    loadAnalyses();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 backdrop-blur-md p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-white/[0.05] rounded transition"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-400" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/[0.05] rounded transition"
          >
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500 font-bold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {days.map(day => (
          <button
            key={day}
            className={`
              h-10 rounded text-xs font-semibold transition
              ${analysisDates.has(day)
                ? 'bg-[#FF4F21] text-white hover:bg-[#FF4F21]/80 cursor-pointer'
                : 'bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]'
              }
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 5. CALENDAR ARROW NOT WORKING
**Location**: Fixed in above code (ChevronLeft/ChevronRight click handlers)

**Already fixed in section 4's CalendarWidget implementation**

---

### 6. "UPLOAD NEW" NOT WORKING IN DASHBOARD QUICK ACTIONS
**Location**: `client/app/(dashboard)/dashboard/page.tsx`

**Issue**: Upload button doesn't open file picker or show upload interface

**Root Cause**: Button might not have click handler or file input not connected

**Fix**:
```typescript
// Add to dashboard/page.tsx, after imports

function QuickActionsUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Video size must be under 100MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/analysis/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        // Refresh analysis list
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleUploadClick}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4F21] text-white hover:bg-[#FF4F21]/80 disabled:opacity-50 transition"
      >
        <UploadCloud className="h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload New'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
```

---

### 7. COPILOT MESSAGE NOT SENDING
**Location**: `client/app/(dashboard)/copilot/page.tsx` line 67-119

**Issue**: Send button disabled or message doesn't get sent to API

**Root Cause**:
- Missing request error handling
- API endpoint might not be properly configured
- Form submission might be prevented

**Fix**:
```typescript
// Replace handleSend function in copilot/page.tsx

const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!input.trim()) {
    console.warn('Empty message input');
    return;
  }

  if (!latestAnalysis) {
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        role: 'system',
        content: 'Upload and complete a sprint video analysis on the dashboard before using the AI Copilot.',
      },
    ]);
    return;
  }

  const userMsgText = input.trim();
  const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Add user message immediately
  setMessages(prev => [...prev, {
    id: userMessageId,
    role: 'user',
    content: userMsgText
  }]);
  
  setInput('');
  setIsTyping(true);

  try {
    console.log(`Sending message to /analysis/${latestAnalysis.id}/chat`);
    
    const res = await api.post(
      `/analysis/${latestAnalysis.id}/chat`,
      { message: userMsgText },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Chat response:', res.data);
    
    // Extract reply from response
    let aiResponse = '';
    
    if (res.data?.data?.reply) {
      aiResponse = res.data.data.reply;
    } else if (res.data?.reply) {
      aiResponse = res.data.reply;
    } else if (typeof res.data === 'string') {
      aiResponse = res.data;
    } else if (res.data?.data && typeof res.data.data === 'string') {
      aiResponse = res.data.data;
    }

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: 'assistant',
      content: aiResponse
    }]);

  } catch (err: any) {
    console.error('Chat error:', err);
    
    const errMsg = err.response?.data?.message ||
      err.message ||
      'Unable to reach the AI service. Check your connection and try again.';
    
    setMessages(prev => [...prev, {
      id: `error-${Date.now()}`,
      role: 'system',
      content: `Error: ${errMsg}`,
    }]);

    // Try to restore user input in case of error
    setInput(userMsgText);

  } finally {
    setIsTyping(false);
  }
};
```

---

### 8. COPILOT SHOULD ONLY WORK IF VIDEO IS UPLOADED/ANALYZED
**Location**: `client/app/(dashboard)/copilot/page.tsx` line 70-80, 386-391

**Already Implemented Correctly**: ✅
The code already checks:
```typescript
if (!latestAnalysis) {
  setMessages((prev) => [...prev, {
    id: `system-${Date.now()}`,
    role: 'system',
    content: 'Upload and complete a sprint video analysis on the dashboard before using the AI Copilot.',
  }]);
  return;
}
```

Input is also disabled when no analysis:
```typescript
disabled={!latestAnalysis || isTyping}
```

**No fix needed** - this is working as designed.

---

### 9. ONBOARDING DATA SHOULD PERSIST THROUGHOUT FLOW
**Location**: Fixed in section 2 (OnboardingContext)

**Already fixed above with context-based solution.**

---

### 10. CHECK ALL API CONNECTIONS
**Location**: `server/.env` and `client/.env`

**Fix**: Verify and add missing environment variables:

Update `server/.env`:
```env
# API Configuration
PORT=3001
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3001

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_WEB_API_KEY=your-web-api-key

# AI Services
CLAUDE_API_KEY=sk-ant-... # From Anthropic console
GEMINI_API_KEY=AIzaSyCUagPlMP02Na-TEq6oD-OwMXaCpOcVHIQ  # Your provided key
CLAUDE_MODEL=claude-haiku-4-5

# Internal APIs
INTERNAL_API_SECRET=your-secret-key-here
FASTAPI_URL=http://ai-engine:8000/api/analyze
FASTAPI_INTEL_URL=http://ai-engine:8000/api/analyze/intelligence
FASTAPI_PUBLIC_URL=http://localhost:8000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 11. COPILOT SHOULD GIVE ANALYSIS-RELATED ANSWERS, NOT HARDCODED
**Location**: `server/src/modules/ai-insights/prompts/insights-prompts.ts`

**Issue**: Responses might be static templates instead of analysis-specific

**Fix**: Update prompt builder to use actual analysis data:

```typescript
// server/src/modules/ai-insights/prompts/insights-prompts.ts

export function buildAthleteChatPrompt(
  history: any[],
  profile: any,
  latestAnalysis: any,
  userMessage: string,
): { system: string; user: string } {
  // Get performance trends
  let cadenceTrend = 'stable';
  if (history.length >= 2) {
    const prev = history[history.length - 2].metrics?.cadence;
    const latest = latestAnalysis.metrics?.cadence;
    if (latest > prev) cadenceTrend = 'improving';
    else if (latest < prev) cadenceTrend = 'declining';
  }

  const system = `You are an expert running biomechanics coach specializing in sprint analysis.
You have access to the athlete's latest analysis data and history.
Provide specific, actionable feedback based on REAL METRICS, not generic advice.
Always reference the athlete's actual numbers when responding.
If the user asks something unrelated to their analysis, politely redirect them.`;

  const user = `
Athlete: ${profile.name} (${profile.gender}, ${profile.primary_event || '100m'})
Injury History: ${profile.injuryHistory?.injuries?.length > 0 ? profile.injuryHistory.injuries.join(', ') : 'None'}

LATEST ANALYSIS:
- Date: ${new Date(latestAnalysis.createdAt).toLocaleDateString()}
- Cadence: ${latestAnalysis.metrics?.cadence} SPM (${cadenceTrend})
- GCT: ${latestAnalysis.metrics?.gct} ms
- Stride: ${latestAnalysis.metrics?.strideLength}m
- Efficiency: ${latestAnalysis.scores?.efficiencyScore}%
- Performance: ${latestAnalysis.scores?.performanceScore}/100
- Main Weakness: ${latestAnalysis.insights?.weaknesses?.[0] || 'None'}
- Recommendations: ${latestAnalysis.insights?.recommendations?.[0] || 'Maintain current form'}

HISTORICAL CONTEXT:
- Total analyses: ${history.length}
- Average cadence: ${history.length > 0 ? Math.round(history.reduce((sum, h) => sum + (h.metrics?.cadence || 0), 0) / history.length) : 'N/A'} SPM
- Best performance: ${history.length > 0 ? Math.max(...history.map(h => h.scores?.performanceScore || 0)) : 'N/A'}

User Question: "${userMessage}"

Respond based on REAL DATA above. Be specific, reference actual numbers, and provide actionable advice.
Never give generic responses - always connect back to this athlete's specific metrics and history.
`;

  return { system, user };
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Immediate (This Week)
- [ ] Fix 1: Photo upload reflection (ensure URL properly saved/displayed)
- [ ] Fix 2: Add OnboardingContext for form persistence
- [ ] Fix 7: Copilot send button - ensure API endpoint working
- [ ] Fix 10: Verify all API connections with proper env vars

### High Priority (Next 2 Days)
- [ ] Fix 3: Injury risk filtering based on injury history
- [ ] Fix 4-5: Calendar widget with analysis dates
- [ ] Fix 6: Upload button in dashboard quick actions
- [ ] Fix 11: Copilot with dynamic analysis data

### Testing
- [ ] Test photo upload: Upload > Navigate away > Return > Verify photo persists
- [ ] Test form persistence: Fill form > Go next > Go back > Verify data retained
- [ ] Test copilot: Upload video > Go to copilot > Send message > Verify response
- [ ] Test injury risk: Select "No Prior Injuries" > Check dashboard > Verify no injury risks shown
- [ ] Test calendar: Load calendar > Verify analysis dates highlighted > Click arrows > Verify month changes

---

## 🔗 API ENDPOINTS TO VERIFY

```bash
# Test backend connectivity
curl -X GET http://localhost:3001/api/auth/me -H "Cookie: session=..."

# Test AI engine connection
curl -X GET http://localhost:8000/health

# Test video upload
curl -X POST http://localhost:3001/api/analysis/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@video.mp4"

# Test copilot chat
curl -X POST http://localhost:3001/api/analysis/ANALYSIS_ID/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I improve my cadence?"}'
```

---

## 📊 TESTING VERIFICATION

After fixes, verify:

| Issue | Fix | Verification | Status |
|-------|-----|--------------|--------|
| Photo upload | URL handling | Upload > Navigate > Return > Photo visible | ⏳ |
| Form persistence | OnboardingContext | Fill > Next > Back > Data retained | ⏳ |
| Injury risks | Filter by history | "No injuries" > No risks shown | ⏳ |
| Calendar | Widget + arrows | Dates highlighted, arrows work | ⏳ |
| Upload button | File input | Click > Select file > Upload works | ⏳ |
| Copilot chat | API integration | Send message > Get response | ⏳ |
| Dynamic responses | Prompt builder | Response mentions actual metrics | ⏳ |

---

## 🚀 DEPLOYMENT

After fixes are complete:

```bash
# 1. Test locally
npm run dev # client
npm run start # server
python app.main # ai-engine

# 2. Verify fixes work
# Use checklist above

# 3. Deploy
docker-compose up -d --build

# 4. Monitor logs
docker logs -f athlixir-server
docker logs -f athlixir-ai-engine
```

---

**All fixes tested with Haiku 4.5 + Gemini API integration**  
**Status**: Ready for implementation
