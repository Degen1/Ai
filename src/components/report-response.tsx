import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { reportContent, REPORT_REASONS, type ReportReason } from '@/services/content-report';

export function ReportResponse({ response }: { response: string }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [limited, setLimited] = useState(false);
  const reportId = useRef<string | null>(null);
  const submitting = useRef(false);

  const submit = async () => {
    if (!reason || submitting.current || state === 'sent') return;
    submitting.current = true;
    reportId.current ??= `report-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    setState('sending');
    setLimited(false);
    try {
      await reportContent(reportId.current, response, reason);
      setState('sent');
      setOpen(false);
    } catch (error) {
      setLimited(error instanceof Error && error.message === 'REPORT_RATE_LIMIT');
      setState('error');
    } finally { submitting.current = false; }
  };

  if (state === 'sent') return <ThemedText accessibilityLiveRegion="polite" type="caption" themeColor="textSecondary" style={{ paddingTop: Spacing.sm }}>ጸብጻብካ ተላኢኹ። የቐንየልና።</ThemedText>;

  return (
    <View style={{ paddingTop: Spacing.xs }}>
      <Pressable
        accessibilityLabel="እዚ መልሲ ጸብጽብ"
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: state === 'sending' }}
        disabled={state === 'sending'}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => ({ alignSelf: 'flex-start', minWidth: ControlSize.touch, height: ControlSize.touch, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>
        <SymbolView name={{ ios: 'flag', android: 'flag', web: 'flag' }} size={15} tintColor={theme.textSecondary} />
      </Pressable>
      {open ? (
        <View style={{ gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: theme.backgroundElement }}>
          <ThemedText type="label">መልሲ ጸብጽብ</ThemedText>
          <View accessibilityRole="radiogroup" style={{ gap: Spacing.xs }}>
            {REPORT_REASONS.map((option) => (
              <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: reason === option.value, disabled: state === 'sending' }} disabled={state === 'sending'} onPress={() => { setReason(option.value); setState('idle'); }} style={{ minHeight: ControlSize.touch, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <SymbolView name={{ ios: reason === option.value ? 'checkmark.circle.fill' : 'circle', android: reason === option.value ? 'radio_button_checked' : 'radio_button_unchecked', web: reason === option.value ? 'radio_button_checked' : 'radio_button_unchecked' }} size={19} tintColor={reason === option.value ? theme.text : theme.textSecondary} />
                <ThemedText type="small" style={{ flex: 1 }}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>
          <ThemedText type="caption" themeColor="textSecondary">እዚ መልስን ምኽንያትካን ጥራይ ናብ ጉጅለ ሳራ ይለኣኽ።</ThemedText>
          {state === 'error' ? <ThemedText accessibilityLiveRegion="polite" type="caption" themeColor="danger">{limited ? 'ብዙሕ ጸብጻብ ተላኢኹ። ድሕሪ ግዜ ፈትን።' : 'ጸብጻብካ ኣይተላእከን። እንደገና ፈትን።'}</ThemedText> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm }}>
            <Pressable accessibilityRole="button" disabled={state === 'sending'} onPress={() => setOpen(false)} style={{ minHeight: ControlSize.touch, paddingHorizontal: Spacing.md, justifyContent: 'center' }}><ThemedText type="label">ይቕረ</ThemedText></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !reason || state === 'sending', busy: state === 'sending' }} disabled={!reason || state === 'sending'} onPress={() => { void submit(); }} style={{ minHeight: ControlSize.touch, paddingHorizontal: Spacing.lg, borderRadius: Radius.full, justifyContent: 'center', backgroundColor: theme.primaryAction, opacity: !reason || state === 'sending' ? 0.5 : 1 }}><ThemedText type="label" style={{ color: theme.primaryActionText }}>{state === 'sending' ? 'ይለኣኽ ኣሎ…' : 'ስደድ'}</ThemedText></Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
