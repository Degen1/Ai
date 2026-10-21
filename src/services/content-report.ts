import { Platform } from 'react-native';

export const REPORT_REASONS = [
  { value: 'harmful', label: 'ጎዳኢ' },
  { value: 'sexual', label: 'ዘይግቡእ ጾታዊ ትሕዝቶ' },
  { value: 'hate', label: 'ጽልኢ ወይ ትንኮሳ' },
  { value: 'incorrect', label: 'ጌጋ ሓበሬታ' },
  { value: 'other', label: 'ካልእ' },
] as const;
export type ReportReason = typeof REPORT_REASONS[number]['value'];

// Public endpoint only; no Firebase admin or other private credential goes in the app.
const reportUrl = process.env.EXPO_PUBLIC_REPORT_API_URL;

export async function reportContent(reportId: string, response: string, reason: ReportReason) {
  if (!reportUrl) throw new Error('REPORT_NOT_CONFIGURED');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const result = await fetch(reportUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, response: response.slice(0, 24_000), reason, platform: Platform.OS }),
      signal: controller.signal,
    });
    if (result.status === 429) throw new Error('REPORT_RATE_LIMIT');
    if (!result.ok) throw new Error('REPORT_UNAVAILABLE');
    const data: unknown = await result.json();
    if (!data || typeof data !== 'object' || !('accepted' in data) || data.accepted !== true) {
      throw new Error('REPORT_UNAVAILABLE');
    }
  } finally { clearTimeout(timer); }
}
