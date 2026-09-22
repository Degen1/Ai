import type { ChatMessage } from '@/data/chat-data';

export interface ChatTransport {
  send(messages: ChatMessage[]): Promise<string>;
}

const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

function createLocalReply(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes('week') || normalized.includes('plan')) {
    return 'Let’s make it manageable. Pick one outcome that would make the week feel successful, then choose three small priorities for each day. Protect one block for deep work, one for admin, and leave breathing room for the unexpected.';
  }

  if (normalized.includes('write') || normalized.includes('draft')) {
    return 'Absolutely. Start with the point your reader needs first, keep the middle to two or three concrete details, and end with a clear next step. Share the audience and rough notes, and I’ll shape the full draft.';
  }

  if (normalized.includes('app') || normalized.includes('idea') || normalized.includes('build')) {
    return 'A strong first version should do one job unusually well. Define the user, the moment they open the app, and the single result they should get. Then build only the shortest path between those three things.';
  }

  if (normalized.includes('learn') || normalized.includes('teach') || normalized.includes('explain')) {
    return 'Here’s a useful idea: systems beat goals when the work repeats. A goal names the destination; a system defines what you do today. Make the next action obvious, small, and easy to repeat, then improve it from real feedback.';
  }

  return 'I’m running in local demo mode right now, but the conversation flow is ready. When you connect the OpenAI API, this response will come from your model while the rest of the interface stays the same.';
}

export const chatTransport: ChatTransport = {
  async send(messages) {
    await pause(650);
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    return createLocalReply(lastUserMessage?.content ?? '');
  },
};
