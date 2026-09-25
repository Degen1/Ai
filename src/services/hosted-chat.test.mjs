import assert from 'node:assert/strict';
import { test } from 'node:test';

import { handleHostedChat } from './hosted-chat.ts';

function request(body) {
  return new Request('https://sara.example/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('hosted endpoint forwards a photo and returns Sara’s reply', async () => {
  let upstreamBody;
  const image = 'data:image/jpeg;base64,aGVsbG8=';
  const response = await handleHostedChat(request({
    mode: 'chat',
    messages: [{ role: 'user', content: 'እዚ እንታይ እዩ?', images: [image] }],
  }), {
    apiKey: 'test-key',
    fetchImpl: async (_url, options) => {
      upstreamBody = JSON.parse(options.body);
      return Response.json({ output_text: 'ስእሊ ርእየዮ።' });
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: 'ስእሊ ርእየዮ።' });
  assert.deepEqual(upstreamBody.input[0].content, [
    { type: 'input_text', text: 'እዚ እንታይ እዩ?' },
    { type: 'input_image', image_url: image },
  ]);
  assert.equal(upstreamBody.store, false);
});

test('hosted endpoint rejects invalid input without contacting OpenAI', async () => {
  let contacted = false;
  const response = await handleHostedChat(request({
    mode: 'chat',
    messages: [{ role: 'user', content: 'photo', images: ['https://example.com/photo.jpg'] }],
  }), {
    apiKey: 'test-key',
    fetchImpl: async () => { contacted = true; throw new Error('should not be called'); },
  });

  assert.equal(response.status, 400);
  assert.equal(contacted, false);
});

test('hosted endpoint reports missing server configuration', async () => {
  const response = await handleHostedChat(request({
    mode: 'chat', messages: [{ role: 'user', content: 'Hello' }],
  }), { apiKey: '' });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'SERVER_NOT_CONFIGURED' });
});
