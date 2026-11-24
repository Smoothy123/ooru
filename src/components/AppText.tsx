import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors } from '@/constants/theme';

/** Every piece of text in the app goes through this, so font rules live in one place. */
export function AppText({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontSize: 15,
  },
});
