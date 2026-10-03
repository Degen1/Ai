import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, FlatList, Keyboard, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KeyboardAvoidingView, useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  Extrapolation,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { ChatComposer } from '@/components/chat-composer';
import { HistoryDrawer } from '@/components/history-drawer';
import { MessageRow } from '@/components/message-row';
import { ModeSwitcher, type AssistantMode } from '@/components/mode-switcher';
import { ProfileButton } from '@/components/profile-avatar';
import { ProfileDrawer } from '@/components/profile-drawer';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { ThinkingIndicator } from '@/components/thinking-indicator';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  type ChatMessage,
} from '@/data/chat-data';
import { saveSelectedPhotos, type SelectedPhoto } from '@/data/chat-images';
import { createConversationId, getConversation, saveConversation } from '@/data/conversation-store';
import { useTheme } from '@/hooks/use-theme';
import { chatTransport } from '@/services/chat-service';

const drawerEasing = Easing.bezier(0.23, 1, 0.32, 1);
type DrawerSide = 'history' | 'profile';

function triggerSwipeHaptic() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

function createMessage(role: ChatMessage['role'], content: string, images?: ChatMessage['images']): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    ...(images?.length ? { images } : {}),
  };
}

function replyErrorMessage(cause: unknown, includesPhoto: boolean) {
  const code = cause instanceof Error ? cause.message : '';
  if (code === 'CHAT_API_NOT_CONFIGURED') return 'ናይ ሳራ ኣገልጋሊ ኣድራሻ ኣይተዳለወን።';
  if (code === 'CHAT_API_402') return 'ናይ OpenAI API ክሬዲት ተወዲኡ ኣሎ። ክሬዲት ምስ ትውስኽ እንደገና ፈትን።';
  if (code === 'PHOTO_READ_FAILED') return 'እቲ ስእሊ ኣብ መሳርሒኻ ክንበብ ኣይከኣለን። ደጊምካ ስእሊ ምረጽ።';
  if (code === 'PHOTO_TOO_LARGE' || code === 'CHAT_API_413') return 'እቲ ስእሊ ብጣዕሚ ዓቢ እዩ። ንእሽቶ ስእሊ ፈትን።';
  if (code === 'PHOTO_REJECTED' || (includesPhoto && code === 'CHAT_API_400')) {
    return 'እቲ ስእሊ ክምርመር ኣይከኣለን። ካልእ ስእሊ ፈትን።';
  }
  if (code === 'CHAT_TIMEOUT') return 'መልሲ ንምርካብ ብዙሕ ግዜ ወሲዱ። እንደገና ፈትን።';
  if (code === 'CHAT_NETWORK_ERROR') return 'ናብ ኣገልጋሊ ሳራ ምትእስሳር ኣይከኣለን። መርበብካ ፈትሽ።';
  if (includesPhoto && code.startsWith('CHAT_API_')) {
    return `ኣገልጋሊ ሳራ ነቲ ስእሊ ክሰርሖ ኣይከኣለን (${code.slice(9)})። እንደገና ፈትን።`;
  }
  return 'ሳራ መልሲ ክትውድእ ኣይከኣለትን። መልእኽትኻ ግን ኣብዚ ኣሎ።';
}

export default function ChatScreen() {
  const { conversation } = useLocalSearchParams<{ conversation?: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => getConversation(conversation)?.messages ?? [],
  );
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);
  const [composerHeight, setComposerHeight] = useState(72);
  const [mode, setMode] = useState<AssistantMode>(() => getConversation(conversation)?.mode ?? 'chat');
  const [activeDrawer, setActiveDrawer] = useState<DrawerSide | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const requestId = useRef(0);
  const requestInFlight = useRef(false);
  const activeConversationId = useRef(getConversation(conversation)?.id ?? null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const drawerWidth = Math.min(screenWidth * 0.82, 460);
  const pageCornerRadius = Math.round(Math.min(
    60,
    Math.max(48, insets.top - 4, Math.min(screenWidth, 430) * 0.14),
  ));
  const drawerPosition = useSharedValue(0);
  const panStart = useSharedValue(0);
  const panSide = useSharedValue(1);
  const keyboardProgress = useSharedValue(0);
  const bottomInset = Math.max(insets.bottom, Spacing.sm);
  const headerHeight = Math.max(insets.top, Spacing.sm) + 64 + Spacing.sm;

  const mountDrawer = useCallback((side: DrawerSide) => {
    Keyboard.dismiss();
    setActiveDrawer(side);
  }, []);
  const finishClosingDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveDrawer(null);
  }, []);
  const finishOpeningDrawer = useCallback(() => setDrawerOpen(true), []);
  const openDrawer = useCallback((side: DrawerSide) => {
    mountDrawer(side);
    setDrawerOpen(true);
  }, [mountDrawer]);
  const closeDrawer = useCallback(() => {
    drawerPosition.set(withTiming(0, {
      duration: 260,
      easing: drawerEasing,
      reduceMotion: ReduceMotion.System,
    }, (finished) => {
      if (finished) scheduleOnRN(finishClosingDrawer);
    }));
  }, [drawerPosition, finishClosingDrawer]);

  useEffect(() => {
    if (drawerOpen && activeDrawer) {
      drawerPosition.set(withTiming(activeDrawer === 'history' ? 1 : -1, {
        duration: 260,
        easing: drawerEasing,
        reduceMotion: ReduceMotion.System,
      }));
    }
  }, [activeDrawer, drawerOpen, drawerPosition]);

  useEffect(() => {
    if (!drawerOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDrawer();
      return true;
    });
    return () => subscription.remove();
  }, [closeDrawer, drawerOpen]);

  const drawerPan = useMemo(() => Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart((event) => {
      panStart.set(drawerPosition.get());
      panSide.set(panStart.get() > 0 ? 1 : panStart.get() < 0 ? -1 : event.translationX >= 0 ? 1 : -1);
      if (panStart.get() === 0) {
        scheduleOnRN(mountDrawer, panSide.get() > 0 ? 'history' : 'profile');
      }
    })
    .onUpdate((event) => {
      const next = panStart.get() + event.translationX / drawerWidth;
      drawerPosition.set(panSide.get() > 0 ? Math.min(1, Math.max(0, next)) : Math.max(-1, Math.min(0, next)));
    })
    .onEnd((event) => {
      const projectedPosition = drawerPosition.get() + (event.velocityX / drawerWidth) * 0.2;
      const target = panSide.get() > 0
        ? (projectedPosition < 0.5 ? 0 : 1)
        : (projectedPosition > -0.5 ? 0 : -1);
      if (target !== panStart.get()) scheduleOnRN(triggerSwipeHaptic);
      drawerPosition.set(withSpring(target, {
        duration: 300,
        dampingRatio: 0.8,
        velocity: event.velocityX / drawerWidth,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (!finished) return;
        if (target === 0) scheduleOnRN(finishClosingDrawer);
        else scheduleOnRN(finishOpeningDrawer);
      }));
    }), [drawerPosition, drawerWidth, finishClosingDrawer, finishOpeningDrawer, mountDrawer, panSide, panStart]);

  const chatSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerPosition.get() * drawerWidth }],
    borderRadius: interpolate(Math.abs(drawerPosition.get()), [0, 1], [0, pageCornerRadius]),
  }));

  useKeyboardHandler({
    onMove: (event) => {
      'worklet';
      keyboardProgress.set(event.progress);
    },
    onInteractive: (event) => {
      'worklet';
      keyboardProgress.set(event.progress);
    },
    onEnd: (event) => {
      'worklet';
      keyboardProgress.set(event.progress);
    },
  }, []);

  // Follow the native keyboard's progress, including interactive dismissal.
  const composerInsetsStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      keyboardProgress.get(),
      [0, 1],
      [bottomInset, Spacing.xs],
      Extrapolation.CLAMP,
    ),
  }));

  const startNewChat = () => {
    requestId.current += 1;
    requestInFlight.current = false;
    activeConversationId.current = null;
    router.setParams({ conversation: undefined });
    setMessages([]);
    setIsThinking(false);
    setError(null);
    setSaveError(null);
    setFailedPrompt(null);
    if (activeDrawer) closeDrawer();
  };

  const changeMode = (nextMode: AssistantMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    startNewChat();
  };

  const openConversation = (id: string) => {
    const selected = getConversation(id);
    if (!selected) return;
    requestId.current += 1;
    requestInFlight.current = false;
    activeConversationId.current = id;
    router.setParams({ conversation: id });
    setMessages(selected.messages);
    setIsThinking(false);
    setError(null);
    setSaveError(null);
    setFailedPrompt(null);
    setMode(selected.mode);
    closeDrawer();
  };

  const onDeleteConversation = (id: string) => {
    if (activeConversationId.current !== id) return;
    startNewChat();
  };

  const requestReply = async (nextMessages: ChatMessage[]) => {
    const activeRequest = requestId.current + 1;
    requestId.current = activeRequest;
    requestInFlight.current = true;
    const activeMode = mode;
    const id = activeConversationId.current ?? createConversationId();
    activeConversationId.current = id;
    if (conversation !== id) router.setParams({ conversation: id });
    setMessages(nextMessages);
    setIsThinking(true);
    setError(null);
    setFailedPrompt(null);
    try {
      saveConversation(id, nextMessages, activeMode);
      setSaveError(null);
    } catch {
      setSaveError('እዚ ዕላል ኣብ መሳርሒኻ ክቕመጥ ኣይከኣለን።');
    }

    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const reply = await chatTransport.send(nextMessages, activeMode);
      if (requestId.current !== activeRequest) return;
      const completedMessages = [...nextMessages, createMessage('assistant', reply)];
      setMessages(completedMessages);
      try {
        saveConversation(id, completedMessages, activeMode);
        setSaveError(null);
      } catch {
        setSaveError('እዚ ዕላል ኣብ መሳርሒኻ ክቕመጥ ኣይከኣለን።');
      }
    } catch (cause) {
      if (requestId.current !== activeRequest) return;
      console.warn('Sara chat request failed:', cause instanceof Error ? cause.message : 'UNKNOWN_ERROR');
      setError(replyErrorMessage(cause, nextMessages.some((message) => Boolean(message.images?.length))));
      setFailedPrompt(nextMessages.at(-1)?.content ?? null);
    } finally {
      if (requestId.current === activeRequest) {
        requestInFlight.current = false;
        setIsThinking(false);
      }
    }
  };

  const sendMessage = (content: string, photos: SelectedPhoto[]) => {
    if (requestInFlight.current) return false;
    try {
      const images = saveSelectedPhotos(photos);
      const messageText = content || 'እዞም ስእልታት ግለጸለይ።';
      void requestReply([...messages, createMessage('user', messageText, images)]);
      return true;
    } catch {
      setError('ስእሊ ክቕመጥ ኣይከኣለን። እንደገና ፈትን።');
      return false;
    }
  };

  return (
    <GestureDetector gesture={drawerPan}>
      <View style={{ flex: 1, backgroundColor: theme.background, overflow: 'hidden' }}>
        {activeDrawer === 'history' ? (
          <HistoryDrawer
            onClose={closeDrawer}
            onDelete={onDeleteConversation}
            onNewChat={startNewChat}
            onSelect={openConversation}
            progress={drawerPosition}
            width={drawerWidth}
          />
        ) : null}
        {activeDrawer === 'profile' ? (
          <ProfileDrawer onClose={closeDrawer} progress={drawerPosition} width={drawerWidth} />
        ) : null}
        <Animated.View
          style={[
            {
              flex: 1,
              zIndex: 2,
              backgroundColor: theme.surface,
              overflow: 'hidden',
              borderCurve: Platform.OS === 'ios' ? 'continuous' : undefined,
            },
            chatSlideStyle,
          ]}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={{ flex: 1 }}>
            <Stack.Screen
              options={{
                title: mode === 'chat' ? 'ዕላል ምስ ሳራ' : 'ስራሕ ምስ ሳራ',
                headerShown: false,
              }}
            />

            <View style={{ flex: 1 }}>
              <View
                pointerEvents="box-none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  paddingTop: Math.max(insets.top, Spacing.sm),
                  paddingHorizontal: Spacing.md,
                  paddingBottom: Spacing.sm,
                }}>
                <View
                  pointerEvents="box-none"
                  style={{
                    height: 64,
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
                      accessibilityLabel="ታሪኽ ዕላላት ክፈት"
                      glass
                      name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
                      onPress={() => openDrawer('history')}
                      size={22}
                    />
                  </View>
                  <View style={{ zIndex: 1 }}>
                    <ProfileButton onPress={() => openDrawer('profile')} />
                  </View>
                </View>
              </View>

              <FlatList
                ref={listRef}
                contentInsetAdjustmentBehavior="never"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  gap: Spacing.lg,
                  paddingTop: headerHeight + (messages.length === 0 ? Spacing.md : Spacing.xl),
                  paddingBottom: composerHeight + bottomInset + Spacing.lg,
                }}
                data={messages}
                keyExtractor={(item) => item.id}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={
                  <>
                    {isThinking ? (
                      <View
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
                          <ThinkingIndicator />
                        </AdaptiveGlass>
                      </View>
                    ) : null}
                    {saveError ? (
                      <View
                        style={{
                          maxWidth: MaxContentWidth,
                          alignSelf: 'center',
                          gap: Spacing.sm,
                          paddingHorizontal: Spacing.md,
                        }}>
                        <ThemedText type="body" themeColor="danger" selectable>{saveError}</ThemedText>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            const id = activeConversationId.current;
                            if (!id) return;
                            try {
                              saveConversation(id, messages, mode);
                              setSaveError(null);
                            } catch {
                              setSaveError('እዚ ዕላል ኣብ መሳርሒኻ ክቕመጥ ኣይከኣለን።');
                            }
                          }}
                          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}>
                          <ThemedText type="label" themeColor="accent">እንደገና ፈትን</ThemedText>
                        </Pressable>
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
                            onPress={() => { void requestReply(messages); }}
                            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignSelf: 'flex-start' })}>
                            <ThemedText type="label" themeColor="accent">
                              እንደገና ፈትን
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
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
              />

              <View pointerEvents="none" style={{ flex: 1 }} />
              <Animated.View style={[composerInsetsStyle, { zIndex: 1 }]}>
                <ChatComposer
                  disabled={isThinking}
                  onHeightChange={setComposerHeight}
                  onSubmit={sendMessage}
                  placeholder={mode === 'chat' ? 'ንሳራ ሕተት' : 'ምስ ሳራ ስራሕ'}
                />
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
          {drawerOpen ? (
            <Pressable
              accessibilityLabel="መሳጢ ዕጸው"
              accessibilityRole="button"
              onPress={closeDrawer}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            />
          ) : null}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
