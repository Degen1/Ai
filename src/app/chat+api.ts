import { handleHostedChat } from '@/services/hosted-chat';

export function GET() {
  return Response.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
}

export function POST(request: Request) {
  return handleHostedChat(request);
}
