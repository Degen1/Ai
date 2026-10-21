export const REPORT_REASONS = ['harmful', 'sexual', 'hate', 'incorrect', 'other'];
export const MAX_REPORT_BYTES = 110_000;

export function validateReport(body) {
  return body && typeof body === 'object' && !Array.isArray(body) &&
    Object.keys(body).every((key) => ['reportId', 'response', 'reason', 'platform'].includes(key)) &&
    typeof body.reportId === 'string' && /^[a-zA-Z0-9_-]{20,80}$/.test(body.reportId) &&
    typeof body.response === 'string' && body.response.trim().length > 0 && body.response.length <= 24_000 &&
    REPORT_REASONS.includes(body.reason) && ['ios', 'android', 'web'].includes(body.platform);
}

export async function acceptReport({ method, contentType, bytes, body, persist }) {
  if (method !== 'POST') return { status: 405, body: { error: 'METHOD_NOT_ALLOWED' } };
  if (!contentType?.toLowerCase().startsWith('application/json')) {
    return { status: 415, body: { error: 'JSON_REQUIRED' } };
  }
  if (bytes > MAX_REPORT_BYTES) return { status: 413, body: { error: 'BODY_TOO_LARGE' } };
  if (!validateReport(body)) return { status: 400, body: { error: 'INVALID_REPORT' } };
  try {
    const saved = await persist({
      reportId: body.reportId, response: body.response.trim(), reason: body.reason, platform: body.platform,
    });
    return saved
      ? { status: 202, body: { accepted: true } }
      : { status: 429, body: { error: 'REPORT_RATE_LIMIT' } };
  } catch {
    return { status: 503, body: { error: 'REPORT_UNAVAILABLE' } };
  }
}
