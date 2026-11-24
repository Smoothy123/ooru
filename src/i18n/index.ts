import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import te from './te.json';

export const LANGUAGES = ['en', 'te'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'ooru:language';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Telugu if the phone's first language is Telugu, otherwise English. */
export function getDeviceLanguage(): Language {
  return getLocales()[0]?.languageCode === 'te' ? 'te' : 'en';
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
  },
  // Start in the device language; a saved choice (if any) is applied before the first screen shows.
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  // React already escapes text, so i18next doesn't need to.
  interpolation: { escapeValue: false },
  // Translations are bundled, so initialise synchronously: the first render already has text.
  initAsync: false,
});

/** A language the user picked inside the app wins over the phone's language. */
export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved) && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // Storage unavailable: keep the device language.
  }
}

/** Switches the UI language everywhere (every useTranslation() re-renders) and remembers it. */
export async function setLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language).catch(() => {});
}

export default i18n;
