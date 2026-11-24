// Font family names as registered with expo-font in app/_layout.tsx.
export const TELUGU_FONT = {
  regular: 'NotoSansTelugu_400Regular',
  bold: 'NotoSansTelugu_700Bold',
} as const;

// Require the two weights we use directly. Importing the package's index would
// pull all nine weights (~1.6 MB) into the app bundle.
export const TELUGU_FONT_FILES = {
  [TELUGU_FONT.regular]: require('@expo-google-fonts/noto-sans-telugu/400Regular/NotoSansTelugu_400Regular.ttf'),
  [TELUGU_FONT.bold]: require('@expo-google-fonts/noto-sans-telugu/700Bold/NotoSansTelugu_700Bold.ttf'),
};
