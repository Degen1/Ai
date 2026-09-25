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
