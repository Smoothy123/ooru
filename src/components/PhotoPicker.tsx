import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@/constants/theme';
import type { PickedPhoto } from '@/types/post';

import { AppButton } from './AppButton';
import { AppText } from './AppText';

// Crop to 4:3 (the shape the detail screen shows) and compress to ~60% quality:
// a phone photo drops from several MB to a few hundred KB, so uploads are quick on 4G.
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.6,
};

interface Props {
  label: string;
  photo: PickedPhoto | null;
  onChange: (photo: PickedPhoto | null) => void;
  error?: string;
}

export function PhotoPicker({ label, photo, onChange, error }: Props) {
  const { t } = useTranslation();

  const pick = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(t('create.cameraDeniedTitle'), t('create.cameraDeniedBody'));
          return;
        }
      }
      // On Android the gallery uses the system photo picker, which needs no permission.
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

      if (result.canceled) return;
      const asset = result.assets[0];
      onChange({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg', fileSize: asset.fileSize });
    } catch {
      Alert.alert(t('create.photoErrorTitle'));
    }
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{label}</AppText>
      {photo ? (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={styles.preview}
            accessibilityLabel={t('create.photoPreview')}
            accessibilityIgnoresInvertColors
          />
          <AppButton title={t('create.removePhoto')} variant="secondary" onPress={() => onChange(null)} />
        </>
      ) : (
        <View style={styles.buttons}>
          <View style={styles.button}>
            <AppButton title={t('create.takePhoto')} variant="secondary" onPress={() => pick('camera')} />
          </View>
          <View style={styles.button}>
            <AppButton title={t('create.choosePhoto')} variant="secondary" onPress={() => pick('library')} />
          </View>
        </View>
      )}
      {error ? (
        <AppText style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
