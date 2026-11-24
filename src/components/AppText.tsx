import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { TELUGU_FONT } from '@/constants/fonts';
import { colors } from '@/constants/theme';

/** Any character in the Telugu Unicode block (U+0C00–U+0C7F). */
const TELUGU_SCRIPT = /[\u0C00-\u0C7F]/;

export function containsTelugu(children: ReactNode): boolean {
  if (typeof children === 'string') return TELUGU_SCRIPT.test(children);
  if (Array.isArray(children)) return children.some(containsTelugu);
  return false;
}

function isBold(fontWeight: unknown): boolean {
  return fontWeight === 'bold' || Number(fontWeight) >= 600;
}

/**
 * Every piece of text in the app goes through this, so font rules live in one place.
 *
 * The font follows the *text*, not the UI language: a Telugu ad still appears
 * while the app is in English, so any string containing Telugu gets Noto Sans Telugu.
 */
export function AppText({ style, children, ...rest }: TextProps) {
  if (!containsTelugu(children)) {
    return (
      <Text {...rest} style={[styles.base, style]}>
        {children}
      </Text>
    );
  }

  const flat: TextStyle = StyleSheet.flatten([styles.base, style]) ?? {};
  const fontSize = flat.fontSize ?? styles.base.fontSize;
  const teluguStyle = {
    // Custom fonts come as one file per weight, so pick the file instead of asking
    // Android to fake a bold version of the regular one.
    fontFamily: isBold(flat.fontWeight) ? TELUGU_FONT.bold : TELUGU_FONT.regular,
    fontWeight: 'normal' as const,
    // Telugu stacks vowel signs above and conjuncts (vattulu) below the letter, so it
    // needs ~1.6x line height or the tops and bottoms get clipped.
    lineHeight: Math.max(flat.lineHeight ?? 0, Math.round(fontSize * 1.6)),
  };

  return (
    <Text {...rest} style={[flat, teluguStyle]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontSize: 15,
  },
});
