import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '@/components/LanguageToggle';
import { TELUGU_FONT, TELUGU_FONT_FILES } from '@/constants/fonts';
import { colors } from '@/constants/theme';
import { DistrictProvider } from '@/context/DistrictContext';
import { loadSavedLanguage } from '@/i18n';

// Keep the native splash screen up until the font and the saved language are
// ready, so Telugu never flashes in the wrong font or the wrong language.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // useTranslation re-renders this layout when the language changes, so titles update instantly.
  const { t, i18n } = useTranslation();
  const [fontsLoaded, fontError] = useFonts(TELUGU_FONT_FILES);
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage().finally(() => setLanguageReady(true));
  }, []);

  // If the font fails to load we still start the app, using the system font.
  const ready = (fontsLoaded || fontError !== null) && languageReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const isTelugu = i18n.language === 'te';

  return (
    <DistrictProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: isTelugu ? { fontFamily: TELUGU_FONT.bold } : undefined,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: t('appName'), headerRight: () => <LanguageToggle /> }} />
        <Stack.Screen name="post/[id]" options={{ title: t('detail.title') }} />
        <Stack.Screen name="create" options={{ title: t('create.title'), presentation: 'modal' }} />
      </Stack>
    </DistrictProvider>
  );
}
