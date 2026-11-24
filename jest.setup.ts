// Native modules don't exist in Jest, so swap in the in-memory mocks
// their authors ship for exactly this purpose.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

// Initialise translations for every test file, always in English so text assertions are stable.
require('@/i18n').default.changeLanguage('en');
