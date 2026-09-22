import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { ChatComposer } from '@/components/chat-composer';
import { MessageRow } from '@/components/message-row';
import { ModeSwitcher, type AssistantMode } from '@/components/mode-switcher';
import { SuggestionCard } from '@/components/suggestion-card';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  getConversation,
  suggestions,
  workSuggestions,
  type ChatMessage,
} from '@/data/chat-data';
import { useTheme } from '@/hooks/use-theme';
import { chatTransport } from '@/services/chat-service';

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
  };
}

export default function ChatScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => getConversation(conversation)?.messages ?? [],
  );
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [mode, setMode] = useState<AssistantMode>('chat');
  const requestId = useRef(0);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const activeSuggestions = mode === 'chat' ? suggestions : workSuggestions;

  const startNewChat = () => {
    requestId.current += 1;
    setMessages([]);
    setIsThinking(false);
    setError(null);
    setFailedPrompt(null);
  };

  const changeMode = (nextMode: AssistantMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    startNewChat();
  };

  const sendMessage = async (content: string) => {
    const userMessage = createMessage('user', content);
    const nextMessages = [...messages, userMessage];
    const activeRequest = requestId.current + 1;
    requestId.current = activeRequest;
    setMessages(nextMessages);
    setIsThinking(true);
    setError(null);
    setFailedPrompt(null);

    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await chatTransport.send(nextMessages);
      if (requestId.current !== activeRequest) return;
      setMessages((current) => [...current, createMessage('assistant', reply)]);
    } catch {
      if (requestId.current !== activeRequest) return;
      setError('Aura could not finish that response. Your message is still here.');
      setFailedPrompt(content);
    } finally {
      if (requestId.current === activeRequest) setIsThinking(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: mode === 'chat' ? 'Aura Chat' : 'Aura Work',
          headerShown: false,
        }}
      />

      <View
        style={{
          paddingTop: Math.max(insets.top, Spacing.sm),
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.sm,
          backgroundColor: 'transparent',
        }}>
        <View
          style={{
            height: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 0,
            }}>
            <ModeSwitcher mode={mode} onChange={changeMode} />
          </View>
          <View style={{ zIndex: 1 }}>
            <SymbolButton
              accessibilityLabel="Open chat history"
              glass
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              onPress={() => router.push('/history')}
              size={22}
            />
          </View>
          <View style={{ zIndex: 1 }}>
            <SymbolButton
              accessibilityLabel="Start a new chat"
              glass
              name={{ ios: 'plus.message', android: 'add_comment', web: 'add_comment' }}
              onPress={startNewChat}
              size={22}
            />
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          gap: Spacing.lg,
          paddingTop: messages.length === 0 ? Spacing.md : Spacing.xl,
          paddingBottom: Spacing.lg,
        }}
        data={messages}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View
            style={{
              width: '100%',
              maxWidth: MaxContentWidth,
              alignSelf: 'center',
              flex: 1,
              justifyContent: 'flex-end',
              paddingHorizontal: Spacing.md,
              paddingBottom: Spacing.sm,
            }}>
            <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: Spacing.xs }}>
              {activeSuggestions.map((suggestion) => (
                <SuggestionCard
                  icon={suggestion.icon}
                  key={suggestion.title}
                  onPress={() => sendMessage(suggestion.prompt)}
                  subtitle={suggestion.subtitle}
                  title={suggestion.title}
                />
              ))}
            </View>
          </View>
        }
        ListFooterComponent={
          <>
            {isThinking ? (
              <View
                accessibilityLabel="Aura is thinking"
                style={{
                  width: '100%',
                  maxWidth: MaxContentWidth,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.twoHalf,
                  paddingHorizontal: Spacing.md,
                }}>
                <AdaptiveGlass
                  style={{
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                    borderWidth: 1,
                    borderColor: theme.glassBorder,
                  }}>
                  <ThemedText type="caption" themeColor="textSecondary">
                    Thinking…
                  </ThemedText>
                </AdaptiveGlass>
              </View>
            ) : null}
            {error ? (
              <View
                style={{
                  maxWidth: MaxContentWidth,
                  alignSelf: 'center',
                  gap: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                }}>
                <ThemedText type="body" themeColor="danger" selectable>
                  {error}
                </ThemedText>
                {failedPrompt ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => sendMessage(failedPrompt)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}>
                    <ThemedText type="label" themeColor="accent">
                      Try again
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
        }}
        renderItem={({ item }) => <MessageRow message={item} />}
        style={{ flex: 1 }}
      />

      <View
        style={{
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          backgroundColor: 'transparent',
        }}>
        <ChatComposer
          disabled={isThinking}
          onSubmit={sendMessage}
          placeholder={mode === 'chat' ? 'Ask Aura' : 'Work with Aura'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
