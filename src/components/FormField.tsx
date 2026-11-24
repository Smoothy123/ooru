import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, MIN_TOUCH_SIZE, radius, spacing } from '@/constants/theme';

import { AppText } from './AppText';

interface Props extends TextInputProps {
  label: string;
  /** Already-translated message; shown in red under the input. */
  error?: string;
  hint?: string;
}

/** Label + text input + hint/error, so every form field looks and behaves the same. */
export function FormField({ label, error, hint, style, multiline, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <AppText style={styles.label}>{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        // Live region: TalkBack reads the error out as soon as it appears.
        <AppText style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText style={styles.hint}>{hint}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: MIN_TOUCH_SIZE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
