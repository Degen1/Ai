import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { acceptReport } from './report-core.mjs';
import { persistReport } from './report-store.mjs';

initializeApp();

// Reports are write-only through this receiver. Firestore client access is denied.
export const reportAiResponse = onRequest({
  region: 'us-central1', minInstances: 0, maxInstances: 1,
  memory: '256MiB', timeoutSeconds: 15, invoker: 'public',
  cors: ['https://degengebre-ai.expo.app', 'https://ai-5f115.web.app', /^http:\/\/localhost:\d+$/],
}, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Allow', 'POST, OPTIONS');
  const result = await acceptReport({
    method: req.method, contentType: req.get('content-type'), bytes: req.rawBody?.length ?? 0,
    body: req.body,
    persist: (report) => persistReport(getFirestore(), report, req.ip),
  });
  if (result.status === 429) res.set('Retry-After', '3600');
  res.status(result.status).json(result.body);
});
