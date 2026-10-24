import { AiInsightsService } from './ai-insights.service';

/**
 * Phase 6 security regression test for the POST /analysis/:id/chat IDOR fix.
 * Before the fix, handleAthleteChat fetched an analysis document by ID with
 * no check that it belonged to the requesting user, leaking a foreign
 * athlete's real metrics/profile into the chat context.
 */
describe('AiInsightsService.handleAthleteChat (ownership enforcement)', () => {
  const OWNER_UID = 'owner-uid-123';
  const ATTACKER_UID = 'attacker-uid-456';
  const ANALYSIS_ID = 'analysis-abc';

  it("blocks a user from chatting about an analysis they don't own, and never reaches the LLM", async () => {
    const foreignAnalysisDoc = {
      exists: true,
      data: () => ({ userId: OWNER_UID, status: 'COMPLETED', metrics: {} }),
    };
    const mockGet = jest.fn().mockResolvedValue(foreignAnalysisDoc);
    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
        where: jest.fn(),
      }),
    };
    const mockFirebaseService = { firestore: mockFirestore } as any;
    const mockClaude = { generateCompletion: jest.fn() };
    const mockGemini = { generateCompletion: jest.fn() };

    const service = new AiInsightsService(
      mockFirebaseService,
      mockClaude as any,
      mockGemini as any,
      {} as any, // AiParserService - unused on the blocked path
      {} as any, // MetricValidatorService
      {} as any, // ConfidenceScoreService
    );

    const reply = await service.handleAthleteChat(
      ANALYSIS_ID,
      ATTACKER_UID,
      'How was my last sprint?',
    );

    // Same "not found"-style message as a genuinely missing analysis —
    // never confirms a foreign analysis ID exists, and never leaks its data.
    expect(reply).toMatch(/couldn't locate/i);
    expect(mockClaude.generateCompletion).not.toHaveBeenCalled();
    expect(mockGemini.generateCompletion).not.toHaveBeenCalled();
  });
});
