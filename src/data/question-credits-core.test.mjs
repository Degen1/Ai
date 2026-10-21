import assert from 'node:assert/strict';
import test from 'node:test';
import { createQuestionCredits } from './question-credits-core.ts';

function fixture(initial = null) {
  let saved = initial;
  let fail = false;
  const storage = { read: () => saved, write: value => { if (fail) throw new Error('DISK_FULL'); saved = value; } };
  return { store: createQuestionCredits(storage), restart: () => createQuestionCredits(storage), fail: () => { fail = true; } };
}
test('two successful questions exhaust the initial allowance across chats', () => {
  const { store } = fixture();
  assert.equal(store.reserve('chat-a-question'), true);
  store.complete('chat-a-question');
  assert.equal(store.reserve('chat-b-question'), true);
  store.complete('chat-b-question');
  assert.equal(store.reserve('third-question'), false);
  assert.equal(store.getSnapshot().remaining, 0);
});
test('a completed reward grants exactly two questions and duplicate callbacks grant nothing', () => {
  const { store } = fixture();
  for (const id of ['1','2']) { store.reserve(id); store.complete(id); }
  store.reward('ad-1'); store.reward('ad-1');
  assert.equal(store.getSnapshot().remaining, 2);
  for (const id of ['3','4']) { assert.equal(store.reserve(id), true); store.complete(id); }
  assert.equal(store.reserve('5'), false);
  store.reward('ad-2');
  assert.equal(store.getSnapshot().remaining, 2);
});
test('failed requests refund once and the same question can be retried', () => {
  const { store } = fixture();
  store.reserve('retry'); store.refund('retry'); store.refund('retry');
  assert.equal(store.getSnapshot().remaining, 2);
  assert.equal(store.reserve('retry'), true);
  store.complete('retry');
  assert.equal(store.getSnapshot().remaining, 1);
});
test('duplicate submissions cannot reserve the same question concurrently', () => {
  const { store } = fixture();
  assert.equal(store.reserve('same'), true);
  assert.equal(store.reserve('same'), false);
  assert.equal(store.getSnapshot().remaining, 1);
});
test('credits persist after restart and deleting chats cannot reset them', () => {
  const f = fixture();
  for (const id of ['1','2']) { f.store.reserve(id); f.store.complete(id); }
  const restored = f.restart();
  assert.equal(restored.reserve('new-chat'), false);
  restored.reward('ad-1');
  assert.equal(f.restart().getSnapshot().remaining, 2);
  const restoredAgain = f.restart();
  restoredAgain.reward('ad-1');
  assert.equal(restoredAgain.getSnapshot().remaining, 2);
});
test('interrupted replies are refunded on restart without repeatedly adding credits', () => {
  const f = fixture();
  f.store.reserve('interrupted');
  assert.equal(f.restart().getSnapshot().remaining, 2);
  assert.equal(f.restart().getSnapshot().remaining, 2);
});
test('failed storage prevents sending or granting a reward with inconsistent state', () => {
  const f = fixture(); f.fail();
  assert.throws(() => f.store.reserve('1'), /DISK_FULL/);
  assert.equal(f.store.getSnapshot().remaining, 2);
  assert.throws(() => f.store.reward('ad'), /DISK_FULL/);
  assert.equal(f.store.getSnapshot().remaining, 2);
});
test('corrupted storage cannot grant an unlimited or negative allowance', () => {
  const { store } = fixture('{"remaining":-1}');
  assert.equal(store.reserve('1'), false);
  store.reward('recovery');
  assert.equal(store.getSnapshot().remaining, 2);
});

test('unavailable ads add two questions only after the current batch is exhausted', () => {
  const { store } = fixture();
  assert.equal(store.grantAdFallback('early-error'), false);
  assert.equal(store.getSnapshot().remaining, 2);
  for (const id of ['1', '2']) { store.reserve(id); store.complete(id); }
  assert.equal(store.grantAdFallback('unavailable-3'), true);
  assert.equal(store.grantAdFallback('duplicate-error'), false);
  assert.equal(store.reserve('3'), true);
  assert.equal(store.grantAdFallback('pending-error'), false);
  store.complete('3');
  assert.equal(store.reserve('4'), true);
  store.complete('4');
  assert.equal(store.grantAdFallback('unavailable-3'), false);
  assert.equal(store.getSnapshot().remaining, 0);
});

test('unavailable inventory permits successive two-question batches across restarts', () => {
  const f = fixture();
  for (const id of ['1', '2']) { f.store.reserve(id); f.store.complete(id); }
  f.store.grantAdFallback('unavailable-3');
  const store = f.restart();
  assert.equal(store.getSnapshot().remaining, 2);
  for (const id of ['3', '4']) { assert.equal(store.reserve(id), true); store.complete(id); }
  assert.equal(store.grantAdFallback('unavailable-5'), true);
  for (const id of ['5', '6']) { assert.equal(store.reserve(id), true); store.complete(id); }
  // Once an ad is ready, the caller stops requesting fallback grants.
  assert.equal(store.reserve('7'), false);
  store.reward('completed-ad');
  assert.equal(store.getSnapshot().remaining, 2);
});

test('the final in-flight question must settle before an unavailable-ad batch can start', () => {
  const { store } = fixture();
  store.reserve('1'); store.complete('1');
  store.reserve('2');
  assert.equal(store.getSnapshot().remaining, 0);
  assert.equal(store.grantAdFallback('unavailable-3'), false);
  store.refund('2');
  assert.equal(store.grantAdFallback('unavailable-3'), false);
  store.reserve('2'); store.complete('2');
  assert.equal(store.grantAdFallback('unavailable-3'), true);
});

test('a failed fallback write leaves the exhausted allowance unchanged for recovery', () => {
  const f = fixture();
  for (const id of ['1', '2']) { f.store.reserve(id); f.store.complete(id); }
  f.fail();
  assert.throws(() => f.store.grantAdFallback('unavailable-3'), /DISK_FULL/);
  assert.equal(f.store.getSnapshot().remaining, 0);
});
