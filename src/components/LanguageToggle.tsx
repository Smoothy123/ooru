import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@/constants/theme';
import { setLanguage } from '@/i18n';

import { AppText } from './AppText';

/** Header button that shows the *other* language in its own script: "తెలుగు" or "English". */
export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const next = i18n.language === 'te' ? 'en' : 'te';

  return (
    <Pressable
      onPress={() => setLanguage(next)}
      accessibilityRole="button"
      accessibilityLabel={t('language.switchA11y')}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText style={styles.label}>{t('language.switchTo')}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
