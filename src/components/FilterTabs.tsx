import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, MIN_TOUCH_SIZE, radius, spacing } from '@/constants/theme';
import type { FeedFilter } from '@/types/post';

import { AppText } from './AppText';

const FILTERS: FeedFilter[] = ['all', 'news', 'classified'];

interface Props {
  value: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

export function FilterTabs({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {FILTERS.map((filter) => {
        const selected = filter === value;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <AppText style={[styles.label, selected && styles.labelSelected]}>{t(`filters.${filter}`)}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    minHeight: MIN_TOUCH_SIZE - 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  labelSelected: {
    color: colors.onPrimary,
  },
});
