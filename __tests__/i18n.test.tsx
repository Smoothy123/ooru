import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import { AppText } from '@/components/AppText';
import i18n, { LANGUAGE_STORAGE_KEY, loadSavedLanguage, setLanguage } from '@/i18n';
import en from '@/i18n/en.json';
import te from '@/i18n/te.json';

type Tree = { [key: string]: string | Tree };

/** { a: { b: 'x' } } -> { 'a.b': 'x' } */
function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((all, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...all, [path]: value } : { ...all, ...flatten(value, path) };
  }, {});
}

const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe('translations', () => {
  const enStrings = flatten(en);
  const teStrings = flatten(te);

  it('Telugu has exactly the same keys as English', () => {
    expect(Object.keys(teStrings).sort()).toEqual(Object.keys(enStrings).sort());
  });

  it('every Telugu string keeps the same {{placeholders}}', () => {
    for (const key of Object.keys(enStrings)) {
      expect({ key, placeholders: placeholders(teStrings[key]) }).toEqual({
        key,
        placeholders: placeholders(enStrings[key]),
      });
    }
  });
});

describe('language preference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('setLanguage switches the UI and remembers the choice', async () => {
    await setLanguage('te');
    expect(i18n.t('filters.news')).toBe('వార్తలు');
    expect(await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('te');
  });

  it('a saved choice wins over the device language on startup', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'te');
    await loadSavedLanguage();
    expect(i18n.language).toBe('te');
  });

  it('ignores junk in storage', async () => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    await loadSavedLanguage();
    expect(i18n.language).toBe('en');
  });
});

describe('AppText', () => {
  it('renders Telugu in Noto Sans Telugu, picking the bold file and a taller line height', async () => {
    await render(<AppText style={{ fontSize: 20, fontWeight: '700' }}>హైదరాబాద్</AppText>);
    expect(screen.getByText('హైదరాబాద్')).toHaveStyle({
      fontFamily: 'NotoSansTelugu_700Bold',
      fontWeight: 'normal',
      lineHeight: 32,
    });
  });

  it('detects Telugu inside mixed text', async () => {
    await render(<AppText>{['Posted by ', 'లక్ష్మి']}</AppText>);
    expect(screen.getByText('Posted by లక్ష్మి')).toHaveStyle({ fontFamily: 'NotoSansTelugu_400Regular' });
  });

  it('leaves English text in the system font', async () => {
    await render(<AppText>Hyderabad</AppText>);
    expect(screen.getByText('Hyderabad')).not.toHaveStyle({ fontFamily: 'NotoSansTelugu_400Regular' });
  });
});
