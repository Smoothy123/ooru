import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { colors } from '@/constants/theme';
import { DistrictProvider } from '@/context/DistrictContext';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <DistrictProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.onPrimary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: t('appName') }} />
        <Stack.Screen name="post/[id]" options={{ title: t('detail.title') }} />
      </Stack>
    </DistrictProvider>
  );
}
