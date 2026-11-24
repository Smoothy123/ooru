import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

import { AppText } from './AppText';

/** Yellow strip shown above content when we're showing saved data instead of live data. */
export function OfflineBanner({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.message}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  title: {
    color: colors.warningText,
    fontWeight: '700',
    fontSize: 14,
  },
  message: {
    color: colors.warningText,
    fontSize: 13,
  },
});
