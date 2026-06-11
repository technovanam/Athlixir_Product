# Quick Start - Top 5 Fixes to Implement NOW

**Total Time**: ~3-4 hours  
**Model**: Haiku 4.5  
**Status**: Use these fixes immediately  

---

## 1️⃣ PHOTO UPLOAD FIX (30 minutes)

**File**: `client/app/onboarding/basic-info/page.tsx`

**Change**: Improve URL extraction in handlePhotoUpload

```typescript
// BEFORE (Lines 56-65):
const response = await api.post('/onboarding/upload-photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
const result = unwrapApiData<{ url?: string }>(response);
if (result?.url) {
  URL.revokeObjectURL(previewUrl);
  setProfilePhoto(result.url);
}

// AFTER:
const response = await api.post('/onboarding/upload-photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

let uploadedUrl = '';
if (response.data?.data?.url) uploadedUrl = response.data.data.url;
else if (response.data?.url) uploadedUrl = response.data.url;
else if (typeof response.data === 'string') uploadedUrl = response.data;

if (uploadedUrl) {
  setProfilePhoto(uploadedUrl);
  setTimeout(() => URL.revokeObjectURL(previewUrl), 100);
} else {
  throw new Error('No URL in response');
}
```

**Test**: Upload photo → Check it displays → Navigate away → Come back → Verify it still shows

---

## 2️⃣ FORM PERSISTENCE FIX (45 minutes)

**Step 1**: Create context file `client/app/context/OnboardingContext.tsx`

```typescript
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface OnboardingContextType {
  state: Record<string, any>;
  updateSection: (section: string, data: any) => void;
  clearAll: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Record<string, any>>({});

  const updateSection = useCallback((section: string, data: any) => {
    setState(prev => ({ ...prev, [section]: data }));
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
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
```

**Step 2**: Update `client/app/onboarding/layout.tsx`

```typescript
import { OnboardingProvider } from '../context/OnboardingContext';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      {/* Rest of layout */}
    </OnboardingProvider>
  );
}
```

**Step 3**: Update basic-info/page.tsx to use context

```typescript
import { useOnboarding } from '../../context/OnboardingContext';

export default function BasicInfoStep() {
  const { state, updateSection } = useOnboarding();
  
  useEffect(() => {
    if (state.basicInfo) {
      setFullName(state.basicInfo.fullName || '');
      setDob(state.basicInfo.dob || '');
      // ... other fields
    }
  }, [state.basicInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSection('basicInfo', { fullName, dob, gender, state, city, profilePhoto });
    
    try {
      await api.post('/onboarding/basic-info', { /* ... */ });
      router.replace('/onboarding/classification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };
}
```

**Test**: Fill form → Click "Save & Continue" → Go back → Verify all fields populated

---

## 3️⃣ COPILOT CHAT FIX (30 minutes)

**File**: `client/app/(dashboard)/copilot/page.tsx` (Replace handleSend function)

```typescript
const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || !latestAnalysis) return;

  const userMsgText = input.trim();
  setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: userMsgText }]);
  setInput('');
  setIsTyping(true);

  try {
    const res = await api.post(
      `/analysis/${latestAnalysis.id}/chat`,
      { message: userMsgText },
      { timeout: 30000 }
    );

    let aiResponse = res.data?.data?.reply || res.data?.reply || res.data?.data || res.data;
    if (typeof aiResponse !== 'string') aiResponse = '';

    if (!aiResponse.trim()) throw new Error('Empty response');

    setMessages(prev => [...prev, { 
      id: `assistant-${Date.now()}`, 
      role: 'assistant', 
      content: aiResponse 
    }]);
  } catch (err: any) {
    console.error('Chat error:', err);
    setMessages(prev => [...prev, {
      id: `error-${Date.now()}`,
      role: 'system',
      content: `Error: ${err.response?.data?.message || err.message}`
    }]);
  } finally {
    setIsTyping(false);
  }
};
```

**Test**: Upload video → Go to Copilot → Type question → Verify message sends & response appears

---

## 4️⃣ INJURY RISK FIX (20 minutes)

**File**: `server/src/modules/analysis/services/analysis.service.ts` (Update getAthleteContext method)

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
  const injuryHistory = d.injury_history as any;
  const hasNoInjuries = injuryHistory?.injuries?.includes('None') ?? false;

  return {
    ageGroup: this.deriveAgeGroup(d.dob as string),
    gender: String(d.gender || 'male').toLowerCase().startsWith('f') ? 'female' : 'male',
    event: String(d.primary_event || '100m').toLowerCase().replace(/\s/g, ''),
    heightCm: d.height_cm as number | undefined,
    injuryHistory: {
      hasHistory: !hasNoInjuries,
      injuries: hasNoInjuries ? [] : (injuryHistory?.injuries || []),
      currentPain: injuryHistory?.current_pain ?? false,
      severity: injuryHistory?.severity ?? 0,
    },
  };
}
```

**File**: `server/src/modules/ai-insights/prompts/insights-prompts.ts` (Update buildAnalysisPrompt)

```typescript
export function buildAnalysisPrompt(promptInput: any, flags: string[], confidence: any): string {
  const { athlete, metrics, scores, injuryRisks, benchmarks, progress } = promptInput;
  
  // Filter injuries if no history
  let contextualRisks = injuryRisks || [];
  if (!athlete?.injuryHistory?.hasHistory) {
    contextualRisks = injuryRisks.filter((r: any) => r.detected === false);
  }

  return `
You are an elite sports biomechanics analyst.

Prior Injuries: ${athlete?.injuryHistory?.hasHistory ? athlete.injuryHistory.injuries.join(', ') : 'None'}
${!athlete?.injuryHistory?.hasHistory ? 'Since athlete has NO prior injuries, focus ONLY on movement quality feedback.' : ''}

Metrics: Cadence ${metrics.cadence} SPM, GCT ${metrics.gct}ms, Stride ${metrics.strideLength}m, Symmetry ${metrics.symmetry}%

Provide: Strengths, Weaknesses, Observations, Recommendations
${contextualRisks.length > 0 ? `Injury Risks: ${contextualRisks.map((r: any) => r.detail).join('; ')}` : 'No injury risks detected.'}
`;
}
```

**Test**: Select "No Prior Injuries" in onboarding → Upload video → Check dashboard → Verify no injury risks shown

---

## 5️⃣ ENV VARS FIX (10 minutes)

**File**: `server/.env`

```env
# Add/Update these
GEMINI_API_KEY=AIzaSyCUagPlMP02Na-TEq6oD-OwMXaCpOcVHIQ
CLAUDE_API_KEY=sk-ant-... # Get from Anthropic console
CLAUDE_MODEL=claude-haiku-4-5
FASTAPI_URL=http://localhost:8000/api/analyze
FASTAPI_INTEL_URL=http://localhost:8000/api/analyze/intelligence
```

**File**: `client/.env.local` (Create if missing)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Test**: 
```bash
# Restart all services
docker-compose restart
# Check logs
docker logs athlixir-server
```

---

## ✅ VERIFICATION CHECKLIST

After implementing all 5 fixes:

```bash
# 1. Test photo upload
[ ] Upload photo → See preview → Navigate away → Return → Photo still shows

# 2. Test form persistence
[ ] Fill all onboarding fields → Navigate through all pages → Go back to first → Data still there

# 3. Test copilot
[ ] Complete video analysis → Go to copilot → Send message → Get AI response

# 4. Test injury risk
[ ] Select "No Prior Injuries" → Complete onboarding → Check dashboard → No injury warnings

# 5. Test API connections
[ ] curl http://localhost:3001/api/auth/me
[ ] curl http://localhost:8000/health
[ ] Check docker logs for errors
```

---

## 🚀 DEPLOYMENT AFTER FIXES

```bash
# 1. Test locally (all 3 services running)
npm run dev              # Terminal 1: Client
npm run start            # Terminal 2: Server  
python app.main         # Terminal 3: AI Engine

# 2. Run verification checklist above

# 3. Deploy with Docker
docker-compose down
docker-compose up -d --build

# 4. Monitor
docker logs -f athlixir-server
docker logs -f athlixir-ai-engine
```

---

## 📞 TROUBLESHOOTING

**Photo not uploading?**
- Check server logs: `docker logs athlixir-server | grep upload`
- Verify FIREBASE_STORAGE_BUCKET in .env
- Check file size < 5MB

**Copilot not responding?**
- Check CLAUDE_API_KEY and GEMINI_API_KEY in .env
- Verify AI engine running: `curl http://localhost:8000/health`
- Check logs: `docker logs athlixir-server | grep chat`

**Form data clearing?**
- Verify OnboardingProvider wraps layout
- Check localStorage: `localStorage.getItem('onboardingState')`
- Clear browser cache and retry

---

**Time to implement**: 3-4 hours  
**Testing time**: 1-2 hours  
**Total**: 5 hours production-ready  

All fixes use **Haiku 4.5** as specified!
