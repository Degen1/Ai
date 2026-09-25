import type { ChatMessage, SavedConversation } from './chat-data';

export type ConversationStorage = {
  read: () => string | null;
  write: (value: string) => void;
};

function isMessage(value: unknown): value is ChatMessage {
  return !!value && typeof value === 'object'
    && 'id' in value && typeof value.id === 'string'
    && 'role' in value && (value.role === 'user' || value.role === 'assistant')
    && 'content' in value && typeof value.content === 'string'
    && (!('images' in value) || (Array.isArray(value.images) && value.images.every((image: unknown) =>
      !!image && typeof image === 'object' && 'id' in image && typeof image.id === 'string'
      && 'uri' in image && typeof image.uri === 'string')));
}

function parseConversations(value: string | null): SavedConversation[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedConversation =>
      !!item && typeof item === 'object'
      && typeof item.id === 'string'
      && typeof item.title === 'string'
      && typeof item.preview === 'string'
      && (item.mode === 'chat' || item.mode === 'work')
      && typeof item.createdAt === 'number'
      && typeof item.updatedAt === 'number'
      && Array.isArray(item.messages)
      && item.messages.every(isMessage),
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function summary(content: string, length: number) {
  return content.replace(/\s+/g, ' ').trim().slice(0, length);
}

export function createConversationStore(storage: ConversationStorage) {
  let conversations: SavedConversation[];
  try {
    conversations = parseConversations(storage.read());
  } catch {
    conversations = [];
  }
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => conversations,
    getConversation: (id?: string) => conversations.find((item) => item.id === id),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    save(id: string, messages: ChatMessage[], mode: SavedConversation['mode'], now = Date.now()) {
      if (messages.length === 0) return;
      const previous = conversations.find((item) => item.id === id);
      const firstPrompt = messages.find((message) => message.role === 'user')?.content ?? '';
      const latestMessage = messages.at(-1)?.content ?? firstPrompt;
      const conversation: SavedConversation = {
        id,
        title: previous?.title || summary(firstPrompt, 64) || 'ሓድሽ ዕላል',
        preview: summary(latestMessage, 110),
        mode,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
        messages: [...messages],
      };
      const next = [conversation, ...conversations.filter((item) => item.id !== id)];
      let writeError: unknown;
      try {
        storage.write(JSON.stringify(next));
      } catch (error) {
        writeError = error;
      }
      conversations = next;
      listeners.forEach((listener) => listener());
      if (writeError) throw writeError;
    },
  };
}
