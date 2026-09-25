import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createConversationStore } from './conversation-store-core.ts';

const user = (id, content) => ({ id, role: 'user', content });
const assistant = (id, content) => ({ id, role: 'assistant', content });

test('saves every conversation and restores messages after a restart', () => {
  let disk = null;
  const storage = { read: () => disk, write: (value) => { disk = value; } };
  const store = createConversationStore(storage);

  store.save('first', [user('u1', 'First chat')], 'chat', 100);
  store.save('first', [user('u1', 'First chat'), assistant('a1', 'First reply')], 'chat', 101);
  store.save('second', [user('u2', 'Work question')], 'work', 102);

  const restarted = createConversationStore(storage);
  assert.deepEqual(restarted.getSnapshot().map(({ id }) => id), ['second', 'first']);
  assert.equal(restarted.getConversation('first')?.messages[1].content, 'First reply');
  assert.equal(restarted.getConversation('second')?.mode, 'work');
  assert.equal(restarted.getConversation('first')?.title, 'First chat');
});

test('keeps a failed write visible and persists it on retry', () => {
  let disk = null;
  let fail = true;
  const store = createConversationStore({
    read: () => disk,
    write(value) {
      if (fail) throw new Error('disk unavailable');
      disk = value;
    },
  });
  const messages = [user('u1', 'Keep this message')];

  assert.throws(() => store.save('chat', messages, 'chat', 100));
  assert.equal(store.getConversation('chat')?.messages[0].content, 'Keep this message');

  fail = false;
  store.save('chat', messages, 'chat', 101);
  assert.equal(JSON.parse(disk)[0].messages[0].content, 'Keep this message');
});

test('restores photo references with a saved chat', () => {
  let disk = null;
  const storage = { read: () => disk, write: (value) => { disk = value; } };
  const message = { ...user('u-photo', 'እዚ እንታይ እዩ?'), images: [{ id: 'photo-1', uri: 'file:///chat-images/photo-1.jpg' }] };
  createConversationStore(storage).save('photos', [message], 'chat');

  const restored = createConversationStore(storage).getConversation('photos');
  assert.deepEqual(restored?.messages[0].images, message.images);
});
