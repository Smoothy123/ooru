import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createClassified, uploadPostImage } from '@/api/posts';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { DistrictPicker } from '@/components/DistrictPicker';
import { FormField } from '@/components/FormField';
import { PhotoPicker } from '@/components/PhotoPicker';
import { colors, spacing } from '@/constants/theme';
import { useDistrict } from '@/context/DistrictContext';
import {
  hasErrors,
  LIMITS,
  toNewClassified,
  validateClassified,
  type ClassifiedField,
  type ClassifiedForm,
} from '@/validation/classified';

export default function CreateClassifiedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { district } = useDistrict();

  const [form, setForm] = useState<ClassifiedForm>({
    title: '',
    description: '',
    price: '',
    district, // defaults to the district the user is browsing
    authorName: '',
    photo: null,
  });
  // Errors appear only after the first submit, then update live as the user fixes them.
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // KeyboardAvoidingView compares its own position with the keyboard's position on
  // screen, so it needs to know how far below the top of the screen (the header) it starts.
  const containerRef = useRef<ComponentRef<typeof View>>(null);
  const [topOffset, setTopOffset] = useState(0);
  const measureTopOffset = () => containerRef.current?.measureInWindow((_x, y) => setTopOffset(y));

  const errors = validateClassified(form);
  const showErrors = submitAttempted && hasErrors(errors);

  const update = <K extends keyof ClassifiedForm>(field: K, value: ClassifiedForm[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  // LIMITS fills placeholders like {{titleMin}} in the messages.
  const errorFor = (field: ClassifiedField) => {
    const key = submitAttempted ? errors[field] : undefined;
    return key ? t(key, LIMITS) : undefined;
  };

  const submit = async () => {
    setSubmitAttempted(true);
    setSubmitError(null);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      // Upload the photo first: the post row stores the photo's public URL.
      const imageUrl = form.photo ? await uploadPostImage(form.photo) : null;
      await createClassified(toNewClassified(form, imageUrl));
      Alert.alert(t('create.successTitle'), t('create.successBody', { district: t(`districts.${form.district}`) }));
      router.back();
    } catch {
      setSubmitError(t('create.submitError'));
      setSubmitting(false);
    }
  };

  return (
    // With Android's edge-to-edge layout the window no longer shrinks for the
    // keyboard, so KeyboardAvoidingView adds bottom padding instead.
    <View ref={containerRef} style={styles.flex} onLayout={measureTopOffset}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={topOffset}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label={t('create.titleLabel')}
            placeholder={t('create.titlePlaceholder')}
            value={form.title}
            onChangeText={(text) => update('title', text)}
            maxLength={LIMITS.titleMax}
            error={errorFor('title')}
          />
          <FormField
            label={t('create.descriptionLabel')}
            placeholder={t('create.descriptionPlaceholder')}
            value={form.description}
            onChangeText={(text) => update('description', text)}
            maxLength={LIMITS.descriptionMax}
            multiline
            error={errorFor('description')}
          />
          <FormField
            label={t('create.priceLabel')}
            placeholder="2500"
            hint={t('create.priceHint')}
            value={form.price}
            onChangeText={(text) => update('price', text)}
            keyboardType="number-pad"
            maxLength={12}
            error={errorFor('price')}
          />
          <DistrictPicker
            caption={t('create.districtLabel')}
            value={form.district}
            onChange={(next) => update('district', next)}
          />
          <FormField
            label={t('create.nameLabel')}
            hint={t('create.nameHint')}
            value={form.authorName}
            onChangeText={(text) => update('authorName', text)}
            maxLength={LIMITS.nameMax}
            autoComplete="name"
            error={errorFor('authorName')}
          />
          <PhotoPicker
            label={t('create.photoLabel')}
            photo={form.photo}
            onChange={(photo) => update('photo', photo)}
            error={errorFor('photo')}
          />

          {showErrors ? (
            <AppText style={styles.formError} accessibilityRole="alert">
              {t('create.fixErrors')}
            </AppText>
          ) : null}
          {submitError ? (
            <AppText style={styles.formError} accessibilityRole="alert">
              {submitError}
            </AppText>
          ) : null}

          <AppButton title={t('create.submit')} onPress={submit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  formError: {
    color: colors.danger,
    fontWeight: '600',
  },
});
