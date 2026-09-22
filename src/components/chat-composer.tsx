import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { SymbolButton } from '@/components/symbol-button';
import { MaxContentWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChatComposerProps = {
  disabled?: boolean;
  onSubmit: (message: string) => void;
  placeholder?: string;
};

export function ChatComposer({
  disabled = false,
  onSubmit,
  placeholder = 'Ask Aura',
}: ChatComposerProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const canSend = draft.trim().length > 0 && !disabled;

  const submit = () => {
    const message = draft.trim();
    if (!message || disabled) return;
    setDraft('');
    onSubmit(message);
    inputRef.current?.focus();
  };

  const addContext = () => {
    setDraft((current) => {
      if (!current.trim()) return 'Context: ';
      return `${current.trimEnd()}\nContext: `;
    });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <View
      style={{
        width: '100%',
        maxWidth: MaxContentWidth,
        alignSelf: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
      }}>
      <AdaptiveGlass
        strong
        style={{
          minHeight: 64,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: 7,
          paddingVertical: 6,
          borderRadius: Radius.full,
          borderWidth: 1,
          borderColor: theme.glassBorder,
          boxShadow: Shadows.composer,
        }}>
        <SymbolButton
          accessibilityLabel="Add context to message"
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          onPress={addContext}
          size={23}
        />
        <TextInput
          ref={inputRef}
          accessibilityLabel="Message Aura"
          autoCapitalize="sentences"
          autoCorrect
          editable={!disabled}
          maxLength={4000}
          multiline
          onChangeText={setDraft}
          placeholder={disabled ? 'Aura is thinking…' : placeholder}
          placeholderTextColor={theme.textSecondary}
          returnKeyType="default"
          selectionColor={theme.accent}
          style={{
            flex: 1,
            maxHeight: 132,
            minHeight: 42,
            paddingVertical: 9,
            color: theme.text,
            fontSize: 16,
            lineHeight: 22,
            textAlignVertical: 'top',
          }}
          value={draft}
        />
        <SymbolButton
          accessibilityLabel="Send message"
          disabled={!canSend}
          filled
          name={{ ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' }}
          onPress={submit}
          size={19}
        />
      </AdaptiveGlass>
    </View>
  );
}
