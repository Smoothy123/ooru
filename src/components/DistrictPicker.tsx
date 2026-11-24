import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DISTRICTS, type DistrictId } from '@/constants/districts';
import { colors, MIN_TOUCH_SIZE, radius, spacing } from '@/constants/theme';

import { AppText } from './AppText';

interface Props {
  value: DistrictId;
  onChange: (district: DistrictId) => void;
}

/** A button showing the current district; tapping it opens a simple list in a modal. */
export function DistrictPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentName = t(`districts.${value}`);

  const choose = (district: DistrictId) => {
    setOpen(false);
    if (district !== value) onChange(district);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('districtPicker.a11yLabel', { district: currentName })}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <AppText style={styles.caption}>{t('districtPicker.caption')}</AppText>
        <AppText style={styles.current}>{currentName} ▾</AppText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          {/* Tapping outside the sheet closes it. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          />
          <View style={styles.sheet}>
            <AppText style={styles.sheetTitle} accessibilityRole="header">
              {t('districtPicker.title')}
            </AppText>
            {DISTRICTS.map((district) => {
              const selected = district === value;
              return (
                <Pressable
                  key={district}
                  onPress={() => choose(district)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <AppText style={[styles.optionLabel, selected && styles.optionSelected]}>
                    {t(`districts.${district}`)}
                  </AppText>
                  {selected ? <AppText style={styles.optionSelected}>✓</AppText> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
  current: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  option: {
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
  },
  optionSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
