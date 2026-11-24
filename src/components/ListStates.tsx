import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing } from '@/constants/theme';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

// The three "no list to show" states: loading, empty and error.

export function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={label} />
    </View>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.center}>
      <AppText style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
    </View>
  );
}

export function ErrorState({ title, hint, onRetry }: { title: string; hint?: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.center}>
      <AppText style={styles.title} accessibilityRole="alert">
        {title}
      </AppText>
      {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
      <View style={styles.action}>
        <AppButton title={t('common.retry')} onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
    minWidth: 160,
  },
});
