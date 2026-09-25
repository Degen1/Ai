import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, TextInput, View } from 'react-native';

import { AdaptiveGlass } from '@/components/adaptive-glass';
import { SymbolButton } from '@/components/symbol-button';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Shadows, Spacing } from '@/constants/theme';
import type { SelectedPhoto } from '@/data/chat-images';
import { useTheme } from '@/hooks/use-theme';

const maxPhotos = 4;
const maxEncodedPhotoLength = 5_600_000;

type ChatComposerProps = {
  disabled?: boolean;
  onHeightChange?: (height: number) => void;
  onSubmit: (message: string, photos: SelectedPhoto[]) => boolean;
  placeholder?: string;
};

export function ChatComposer({ disabled = false, onHeightChange, onSubmit, placeholder = 'ንሳራ ሕተት' }: ChatComposerProps) {
  const [draft, setDraft] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const theme = useTheme();
  const canSend = (draft.trim().length > 0 || photos.length > 0) && !disabled;

  const submit = () => {
    if (!canSend) return;
    if (onSubmit(draft.trim(), photos)) {
      setDraft('');
      setPhotos([]);
      setPhotoError(null);
      inputRef.current?.focus();
    }
  };

  const addPhotos = async () => {
    if (disabled || photos.length >= maxPhotos) return;
    Keyboard.dismiss();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: maxPhotos - photos.length,
        quality: 0.65,
        base64: true,
      });
      if (result.canceled) return;
      const next: SelectedPhoto[] = [];
      for (const asset of result.assets) {
        if (!asset.base64 || asset.base64.length > maxEncodedPhotoLength) {
          setPhotoError('ስእሊ ብጣዕሚ ዓቢ እዩ። ካልእ ስእሊ ፈትን።');
          continue;
        }
        next.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          uri: asset.uri,
          base64: asset.base64,
        });
      }
      if (next.length > 0) setPhotos((current) => [...current, ...next].slice(0, maxPhotos));
      if (next.length === result.assets.length) setPhotoError(null);
    } catch {
      setPhotoError('ስእሊ ክኽፈት ኣይከኣለን። እንደገና ፈትን።');
    }
  };

  return (
    <View onLayout={({ nativeEvent }) => onHeightChange?.(Math.ceil(nativeEvent.layout.height))} style={{
      width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.xs,
      paddingHorizontal: Spacing.md, paddingTop: Spacing.sm,
    }}>
      {photos.length > 0 ? (
        <ScrollView horizontal keyboardShouldPersistTaps="always"
          contentContainerStyle={{ gap: Spacing.sm, paddingVertical: Spacing.xs }}>
          {photos.map((photo) => (
            <View key={photo.id} style={{ width: 72, height: 72 }}>
              <Image source={{ uri: photo.uri }} style={{ width: 72, height: 72, borderRadius: Radius.md }} />
              <Pressable
                accessibilityLabel="ስእሊ ኣውጽእ"
                accessibilityRole="button"
                onPress={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))}
                style={{
                  position: 'absolute', right: -5, top: -5, width: 24, height: 24,
                  borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: theme.text,
                }}>
                <ThemedText style={{ color: theme.background, fontSize: 16, lineHeight: 20 }}>×</ThemedText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
      {photoError ? <ThemedText type="caption" themeColor="danger">{photoError}</ThemedText> : null}
      <AdaptiveGlass strong style={{
        minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        paddingHorizontal: 7, paddingVertical: 6, borderRadius: Radius.full,
        borderWidth: 1, borderColor: theme.glassBorder, boxShadow: Shadows.composer,
      }}>
        <SymbolButton
          accessibilityLabel="ስእሊ ወስኽ"
          disabled={disabled || photos.length >= maxPhotos}
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          onPress={() => { void addPhotos(); }}
          size={23}
        />
        <TextInput
          ref={inputRef}
          accessibilityLabel="ንሳራ መልእኽቲ ጽሓፍ"
          autoCapitalize="sentences"
          autoCorrect
          editable={!disabled}
          maxLength={4000}
          multiline
          onChangeText={setDraft}
          placeholder={disabled ? 'ሳራ ትሓስብ ኣላ…' : placeholder}
          placeholderTextColor={theme.textSecondary}
          returnKeyType="default"
          selectionColor={theme.accent}
          style={{
            flex: 1, maxHeight: 132, minHeight: 42, paddingVertical: 9,
            color: theme.text, fontSize: 16, lineHeight: 22, textAlignVertical: 'top',
          }}
          value={draft}
        />
        <SymbolButton
          accessibilityLabel="መልእኽቲ ስደድ"
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
