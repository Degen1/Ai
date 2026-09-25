const maxBodyBytes = 24 * 1024 * 1024;
const maxImageLength = 5_600_023;
const systemInstructions = 'You are ሳራ, a helpful assistant. Use ሳራ when referring to yourself. Reply in Tigrinya by default. If the user explicitly asks for another language, use it.';

type IncomingMessage = {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
};

type ChatBody = {
  mode: 'chat' | 'work';
  messages: IncomingMessage[];
};

function validMessages(messages: unknown): messages is IncomingMessage[] {
  return Array.isArray(messages) && messages.length > 0 && messages.length <= 40 &&
    messages.at(-1)?.role === 'user' &&
    messages.reduce((count, message) => count + (message?.images?.length ?? 0), 0) <= 4 &&
    messages.every((message) => message &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0 && message.content.length <= 12_000 &&
      (message.images === undefined || (
        message.role === 'user' && Array.isArray(message.images) && message.images.length <= 4 &&
        message.images.every((image: unknown) => typeof image === 'string' &&
          /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image) && image.length <= maxImageLength)
      )));
}

function extractReply(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const response = data as {
    output_text?: unknown;
    output?: { content?: { type?: string; text?: string }[] }[];
  };
  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }
  return response.output?.flatMap((item) =>
    item.content?.filter((part) => part.type === 'output_text' && typeof part.text === 'string')
      .map((part) => part.text ?? '') ?? [],
  ).join('\n').trim() ?? '';
}

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function handleHostedChat(
  request: Request,
  {
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL || 'gpt-6-luna',
    fetchImpl = fetch,
  }: { apiKey?: string; model?: string; fetchImpl?: typeof fetch } = {},
): Promise<Response> {
  if (!apiKey) return json(503, { error: 'SERVER_NOT_CONFIGURED' });
  if (Number(request.headers.get('content-length')) > maxBodyBytes) {
    return json(413, { error: 'BODY_TOO_LARGE' });
  }

  let body: ChatBody;
  try {
    const raw = await request.text();
    if (raw.length > maxBodyBytes) return json(413, { error: 'BODY_TOO_LARGE' });
    body = JSON.parse(raw) as ChatBody;
  } catch {
    return json(400, { error: 'INVALID_JSON' });
  }
  if (!body || !validMessages(body.messages) || !['chat', 'work'].includes(body.mode)) {
    return json(400, { error: 'INVALID_REQUEST' });
  }

  try {
    const upstream = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
      const failure = await upstream.json().catch(() => null) as {
        error?: { code?: string; param?: string; message?: string };
      } | null;
      if (upstream.status === 429 && failure?.error?.code === 'credit_balance_exhausted') {
        return json(402, { error: 'CREDIT_BALANCE_EXHAUSTED' });
      }
      if (upstream.status === 400 &&
        (failure?.error?.param?.includes('image') || /image|photo/i.test(failure?.error?.message ?? ''))) {
        return json(422, { error: 'PHOTO_REJECTED' });
      }
      return json(502, { error: 'UPSTREAM_ERROR' });
    }
    const reply = extractReply(await upstream.json());
    return reply ? json(200, { reply }) : json(502, { error: 'EMPTY_RESPONSE' });
  } catch {
    return json(502, { error: 'UPSTREAM_UNAVAILABLE' });
  }
}
