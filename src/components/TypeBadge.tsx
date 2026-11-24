import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@/constants/theme';
import type { PostType } from '@/types/post';

import { AppText } from './AppText';

export function TypeBadge({ type }: { type: PostType }) {
  const { t } = useTranslation();
  const isNews = type === 'news';

  return (
    <View style={[styles.badge, isNews ? styles.newsBadge : styles.classifiedBadge]}>
      <AppText style={[styles.label, isNews ? styles.newsLabel : styles.classifiedLabel]}>
        {t(`postType.${type}`)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  newsBadge: {
    backgroundColor: colors.newsBg,
  },
  classifiedBadge: {
    backgroundColor: colors.classifiedBg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  newsLabel: {
    color: colors.news,
  },
  classifiedLabel: {
    color: colors.classified,
  },
});
