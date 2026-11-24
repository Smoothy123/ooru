import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

// Every piece of UI text goes through t('key') from day one, so adding
// Telugu later means adding a second JSON file, not rewriting screens.
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  // React already escapes text, so i18next doesn't need to.
  interpolation: { escapeValue: false },
  // Resources are bundled, so initialise synchronously: the first render already has text.
  initAsync: false,
});

export default i18n;
