import { File, Paths } from 'expo-file-system';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import type { ChatMessage, SavedConversation } from '@/data/chat-data';
import { createConversationStore } from '@/data/conversation-store-core';

const storageName = 'sara-conversations-v1';
const emptyConversations: SavedConversation[] = [];

const store = createConversationStore({
  read() {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(storageName);
    }
    const file = new File(Paths.document, `${storageName}.json`);
    return file.exists ? file.textSync() : null;
  },
  write(value) {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(storageName, value);
      return;
    }
    const temporary = new File(Paths.document, `${storageName}.tmp`);
    temporary.create({ overwrite: true });
    temporary.write(value);
    temporary.moveSync(new File(Paths.document, `${storageName}.json`), { overwrite: true });
  },
});

export function useConversations() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => emptyConversations);
}

export const getConversation = store.getConversation;

export function deleteConversation(id: string) {
  const removed = store.delete(id);
  if (!removed || Platform.OS === 'web') return;

  const remainingImages = new Set(store.getSnapshot().flatMap((conversation) =>
    conversation.messages.flatMap((message) => message.images?.map((image) => image.uri) ?? []),
  ));
  for (const image of removed.messages.flatMap((message) => message.images ?? [])) {
    if (!image.uri.startsWith('file:') || remainingImages.has(image.uri)) continue;
    try {
      const file = new File(image.uri);
      if (file.exists) file.delete();
    } catch {
      // The conversation is already removed; a missing attachment should not restore it.
    }
  }
}

export function saveConversation(
  id: string,
  messages: ChatMessage[],
  mode: SavedConversation['mode'],
) {
  store.save(id, messages, mode);
}

export function createConversationId() {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
