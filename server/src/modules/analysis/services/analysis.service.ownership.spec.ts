import { NotFoundException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

/**
 * Phase 6 security regression tests for the GET /analysis/:id IDOR fix.
 * Firestore is mocked directly; these are unit tests, not e2e tests
 * (no existing Firestore/Firebase test-project fixture exists in this repo).
 */
describe('AnalysisService.getAnalysis (ownership enforcement)', () => {
  const OWNER_UID = 'owner-uid-123';
  const OTHER_UID = 'attacker-uid-456';
  const ANALYSIS_ID = 'analysis-abc';

  function buildService(docData: Record<string, unknown> | null) {
    const mockDoc = {
      exists: docData !== null,
      id: ANALYSIS_ID,
      data: () => docData,
    };
    const mockGet = jest.fn().mockResolvedValue(mockDoc);
    const mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet }),
      }),
    };
    const mockFirebaseService = { firestore: mockFirestore } as any;

    const service = new AnalysisService(
      mockFirebaseService,
      {} as any, // AnalysisGateway - unused by getAnalysis
      {} as any, // AiInsightsService - unused by getAnalysis
    );
    return service;
  }

  it('returns the analysis when the requesting user owns it', async () => {
    const service = buildService({
      userId: OWNER_UID,
      status: 'COMPLETED',
      metrics: { cadence: 180 },
    });

    const result = await service.getAnalysis(ANALYSIS_ID, { uid: OWNER_UID });
    expect(result).toMatchObject({ id: ANALYSIS_ID, status: 'COMPLETED' });
  });

  it('blocks a different authenticated user from reading someone else\'s analysis (IDOR fix)', async () => {
    const service = buildService({
      userId: OWNER_UID,
      status: 'COMPLETED',
      metrics: { cadence: 180 },
    });

    await expect(
      service.getAnalysis(ANALYSIS_ID, { uid: OTHER_UID }),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns NotFoundException (not a raw 500) when the analysis does not exist', async () => {
    const service = buildService(null);

    await expect(
      service.getAnalysis(ANALYSIS_ID, { uid: OWNER_UID }),
    ).rejects.toThrow(NotFoundException);
  });

  it('treats a missing/empty auth identity as unauthorized (never matches a real owner)', async () => {
    const service = buildService({ userId: OWNER_UID, status: 'COMPLETED' });

    await expect(service.getAnalysis(ANALYSIS_ID, {})).rejects.toThrow(
      NotFoundException,
    );
  });
});
