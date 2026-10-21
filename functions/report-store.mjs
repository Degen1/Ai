import { createHash } from 'node:crypto';

export async function persistReport(db, { reportId, ...report }, ip, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  // Never save the IP alongside a report; rate-limit buckets rotate hourly.
  const bucket = createHash('sha256').update(`${hour}:${ip ?? 'unknown'}`).digest('hex');
  const reportRef = db.collection('ai_content_reports').doc(reportId);
  const rateRef = db.collection('_report_limits').doc(bucket);
  const dailyRef = db.collection('_report_limits').doc(`daily-${day}`);
  return db.runTransaction(async (tx) => {
    const existing = await tx.get(reportRef);
    if (existing.exists) return true;
    const [rate, daily] = await tx.getAll(rateRef, dailyRef);
    const rateCount = rate.data()?.count ?? 0;
    const dailyCount = daily.data()?.count ?? 0;
    if (rateCount >= 10 || dailyCount >= 500) return false;
    tx.create(reportRef, { ...report, status: 'pending', createdAt: now });
    tx.set(rateRef, { count: rateCount + 1, window: hour });
    tx.set(dailyRef, { count: dailyCount + 1, window: day });
    return true;
  });
}
