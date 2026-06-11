/**
 * Unwraps NestJS responses that pass through the global ResponseInterceptor.
 * Controllers that return { success, message, data } get wrapped twice.
 */
export function unwrapApiData<T = unknown>(response: { data?: unknown }): T {
  let payload = response?.data as Record<string, unknown> | undefined;
  if (!payload) return {} as T;

  if (payload.data !== undefined && ('success' in payload || 'message' in payload)) {
    payload = payload.data as Record<string, unknown>;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    payload.data !== undefined &&
    ('success' in payload || 'message' in payload)
  ) {
    return payload.data as T;
  }

  return payload as T;
}

/** Profile fields from onboarding status (full_name, dob, injury_history, etc.) */
export function getOnboardingProfile(response: { data?: unknown }): Record<string, unknown> {
  const status = unwrapApiData<{
    currentStep?: string;
    data?: Record<string, unknown>;
  }>(response);
  return (status?.data as Record<string, unknown>) || {};
}

export function getOnboardingCurrentStep(response: { data?: unknown }): string {
  const status = unwrapApiData<{ currentStep?: string }>(response);
  return status?.currentStep || 'basic-info';
}
