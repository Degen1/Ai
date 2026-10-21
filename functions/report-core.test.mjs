import assert from 'node:assert/strict';
import { test } from 'node:test';
import { acceptReport, MAX_REPORT_BYTES } from './report-core.mjs';
import { persistReport } from './report-store.mjs';

const report = { reportId: 'test-report-1234567890', response: 'A response to review', reason: 'harmful', platform: 'android' };
const input = (overrides = {}) => ({ method: 'POST', contentType: 'application/json', bytes: 100, body: report, persist: async () => true, ...overrides });

test('acknowledges only a successful durable write and sends only intended fields', async () => {
  let saved;
  const result = await acceptReport(input({ persist: async (body) => { saved = body; return true; } }));
  assert.equal(result.status, 202);
  assert.deepEqual(saved, report);
  const failed = await acceptReport(input({ persist: async () => { throw new Error('offline'); } }));
  assert.equal(failed.status, 503);
  assert.equal(failed.body.accepted, undefined);
});

test('rejects unrecognized fields, invalid reasons, blank text, and unsafe document IDs without writing', async () => {
  for (const invalid of [
    { ...report, email: 'private@example.com' }, { ...report, reason: 'invalid' },
    { ...report, response: ' ' }, { ...report, reportId: '../private/doc' },
    { ...report, response: 'a'.repeat(24001) }, { ...report, platform: 'unknown' },
  ]) {
    const result = await acceptReport(input({ body: invalid, persist: async () => assert.fail('must not write') }));
    assert.equal(result.status, 400);
  }
});

test('rejects oversized and non-JSON requests before writing', async () => {
  assert.equal((await acceptReport(input({ bytes: MAX_REPORT_BYTES + 1 }))).status, 413);
  assert.equal((await acceptReport(input({ contentType: 'text/plain' }))).status, 415);
  assert.equal((await acceptReport(input({ method: 'GET' }))).status, 405);
});

test('does not claim success when the persisted rate limiter declines a report', async () => {
  const result = await acceptReport(input({ persist: async () => false }));
  assert.equal(result.status, 429);
  assert.equal(result.body.accepted, undefined);
});

function testDatabase() {
  const records = new Map();
  const snapshot = (path) => ({ exists: records.has(path), data: () => records.get(path) });
  return {
    records,
    collection: (collection) => ({ doc: (id) => `${collection}/${id}` }),
    runTransaction: (callback) => callback({
      get: async (path) => snapshot(path),
      getAll: async (...paths) => paths.map(snapshot),
      create: (path, value) => { assert.equal(records.has(path), false); records.set(path, value); },
      set: (path, value) => records.set(path, value),
    }),
  };
}

test('retries do not add reports or spend rate-limit capacity twice', async () => {
  const db = testDatabase();
  const now = new Date('2026-10-21T12:00:00Z');
  assert.equal(await persistReport(db, report, '192.0.2.1', now), true);
  assert.equal(await persistReport(db, report, '192.0.2.1', now), true);
  assert.equal(db.records.size, 3);
  assert.equal(db.records.get('_report_limits/daily-2026-10-21').count, 1);
  assert.equal(JSON.stringify(db.records.get(`ai_content_reports/${report.reportId}`)).includes('192.0.2.1'), false);
});

test('caps each IP at ten new reports per hour, then permits the next hour', async () => {
  const db = testDatabase();
  for (let i = 0; i < 11; i += 1) {
    assert.equal(await persistReport(db, { ...report, reportId: `report-${i}` }, '192.0.2.1', new Date('2026-10-21T12:00:00Z')), i < 10);
  }
  assert.equal(await persistReport(db, { ...report, reportId: 'next-hour' }, '192.0.2.1', new Date('2026-10-21T13:00:00Z')), true);
});

test('enforces the global daily ceiling even across different clients', async () => {
  const db = testDatabase();
  db.records.set('_report_limits/daily-2026-10-21', { count: 500 });
  assert.equal(await persistReport(db, report, '192.0.2.2', new Date('2026-10-21T12:00:00Z')), false);
  assert.equal(db.records.has(`ai_content_reports/${report.reportId}`), false);
});
