import type { ChatMessage } from '@/data/chat-data';
import { imageDataUrl } from '@/data/chat-images';

export type ChatMode = 'chat' | 'work';

export interface ChatTransport {
  send(messages: ChatMessage[], mode: ChatMode): Promise<string>;
}

const apiUrl = process.env.EXPO_PUBLIC_CHAT_API_URL?.replace(/\/$/, '');

export const chatTransport: ChatTransport = {
  async send(messages, mode) {
    if (!apiUrl) {
      throw new Error('CHAT_API_NOT_CONFIGURED');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const recent = messages.slice(-40);
      let remainingImages = 4;
      const chosen = new Map<number, ChatMessage['images']>();
      for (let index = recent.length - 1; index >= 0 && remainingImages > 0; index -= 1) {
        const images = recent[index].images?.slice(-remainingImages);
        if (images?.length) {
          chosen.set(index, images);
          remainingImages -= images.length;
        }
      }
      const outgoing = await Promise.all(recent.map(async ({ role, content }, index) => ({
        role,
        content,
        ...(chosen.has(index) ? {
          images: await Promise.all(chosen.get(index)!.map((image) => imageDataUrl(image.uri))),
        } : {}),
      })));
      let response: Response;
      try {
        response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, messages: outgoing }),
          signal: controller.signal,
        });
      } catch (cause) {
        if (controller.signal.aborted) throw new Error('CHAT_TIMEOUT');
        throw new Error('CHAT_NETWORK_ERROR', { cause });
      }

      if (!response.ok) {
        const failure: unknown = await response.json().catch(() => null);
        const serverCode = failure && typeof failure === 'object' && 'error' in failure
          ? failure.error : null;
        if (serverCode === 'CREDIT_BALANCE_EXHAUSTED') throw new Error('CHAT_API_402');
        if (serverCode === 'BODY_TOO_LARGE') throw new Error('PHOTO_TOO_LARGE');
        if (serverCode === 'PHOTO_REJECTED') throw new Error('PHOTO_REJECTED');
        throw new Error(`CHAT_API_${response.status}`);
      }

      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== 'object' ||
        !('reply' in data) ||
        typeof data.reply !== 'string' ||
        !data.reply.trim()
      ) {
        throw new Error('CHAT_API_INVALID_RESPONSE');
      }
      return data.reply.trim();
    } finally {
      clearTimeout(timeout);
    }
  },
};
