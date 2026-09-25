import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const maxBodyBytes = 24 * 1024 * 1024;
const systemInstructions = 'You are ሳራ, a helpful assistant. Use ሳራ when referring to yourself. Reply in Tigrinya by default. If the user explicitly asks for another language, use it.';

function sendJson(response, status, body, allowedOrigin) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin, Vary: 'Origin' } : {}),
  });
  response.end(JSON.stringify(body));
}

async function readBytes(request, limit) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > limit) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(request) {
  return JSON.parse((await readBytes(request, maxBodyBytes)).toString('utf8'));
}

async function sendUpstreamError(response, upstream, corsOrigin) {
  if (upstream.status === 400) {
    const failure = await upstream.json().catch(() => null);
    if (failure?.error?.param?.includes?.('image') ||
        /image|photo/i.test(failure?.error?.message ?? '')) {
      sendJson(response, 422, { error: 'PHOTO_REJECTED' }, corsOrigin);
      return;
    }
  }
  if (upstream.status === 429) {
    const failure = await upstream.json().catch(() => null);
    if (failure?.error?.code === 'credit_balance_exhausted') {
      sendJson(response, 402, { error: 'CREDIT_BALANCE_EXHAUSTED' }, corsOrigin);
      return;
    }
  }
  sendJson(response, 502, { error: 'UPSTREAM_ERROR' }, corsOrigin);
}

function validMessages(messages) {
  return Array.isArray(messages) && messages.length > 0 && messages.length <= 40 &&
    messages.at(-1)?.role === 'user' &&
    messages.reduce((count, message) => count + (message?.images?.length ?? 0), 0) <= 4 &&
    messages.every((message) => message &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0 && message.content.length <= 12_000 &&
      (message.images === undefined || (
        message.role === 'user' && Array.isArray(message.images) && message.images.length <= 4 &&
        message.images.every((image) => typeof image === 'string' &&
          /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image) &&
          image.length <= 5_600_023)
      )));
}

export function extractReply(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = data?.output?.flatMap((item) =>
    item?.content?.filter((content) => content?.type === 'output_text' && typeof content.text === 'string')
      .map((content) => content.text) ?? []
  ) ?? [];
  return parts.join('\n').trim();
}

export function createChatServer({
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL || 'gpt-6-luna',
  allowedOrigin = process.env.CHAT_ALLOWED_ORIGIN,
  fetchImpl = fetch,
} = {}) {
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    const corsOrigin = origin && allowedOrigin === origin ? origin : undefined;

    if (origin && !corsOrigin) {
      sendJson(response, 403, { error: 'ORIGIN_NOT_ALLOWED' });
      return;
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': corsOrigin || '',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      response.end();
      return;
    }
    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, { ok: true, configured: Boolean(apiKey) }, corsOrigin);
      return;
    }
    if (request.method !== 'POST' || request.url !== '/chat') {
      sendJson(response, 404, { error: 'NOT_FOUND' }, corsOrigin);
      return;
    }
    if (!apiKey) {
      sendJson(response, 503, { error: 'SERVER_NOT_CONFIGURED' }, corsOrigin);
      return;
    }

    let body;
    try {
      body = await readJson(request);
    } catch (cause) {
      sendJson(response, cause?.message === 'BODY_TOO_LARGE' ? 413 : 400,
        { error: cause?.message === 'BODY_TOO_LARGE' ? 'BODY_TOO_LARGE' : 'INVALID_JSON' }, corsOrigin);
      return;
    }
    if (!validMessages(body?.messages) || !['chat', 'work'].includes(body?.mode)) {
      sendJson(response, 400, { error: 'INVALID_REQUEST' }, corsOrigin);
      return;
    }

    try {
      const upstream = await fetchImpl('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          store: false,
          instructions: body.mode === 'work'
            ? `${systemInstructions} For work requests, be clear, structured, and action oriented.`
            : systemInstructions,
          input: body.messages.map(({ role, content, images }) => ({
            role,
            content: images?.length ? [
              { type: 'input_text', text: content },
              ...images.map((image_url) => ({ type: 'input_image', image_url })),
            ] : content,
          })),
        }),
        signal: AbortSignal.timeout(55_000),
      });

      if (!upstream.ok) {
        await sendUpstreamError(response, upstream, corsOrigin);
        return;
      }
      const reply = extractReply(await upstream.json());
      if (!reply) {
        sendJson(response, 502, { error: 'EMPTY_RESPONSE' }, corsOrigin);
        return;
      }
      sendJson(response, 200, { reply }, corsOrigin);
    } catch {
      sendJson(response, 502, { error: 'UPSTREAM_UNAVAILABLE' }, corsOrigin);
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.CHAT_SERVER_HOST || '127.0.0.1';
  const port = Number(process.env.CHAT_SERVER_PORT || 8787);
  createChatServer().listen(port, host, () => {
    console.log(`ሳራ chat server listening on http://${host}:${port}`);
  });
}
