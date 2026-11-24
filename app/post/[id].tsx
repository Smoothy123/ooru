import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchPostById } from '@/api/posts';
import { AppText } from '@/components/AppText';
import { EmptyState, ErrorState, LoadingState } from '@/components/ListStates';
import { TypeBadge } from '@/components/TypeBadge';
import { colors, spacing } from '@/constants/theme';
import type { Post } from '@/types/post';
import { formatPrice, formatTimeAgo } from '@/utils/format';

type DetailState = { status: 'loading' } | { status: 'notFound' } | { status: 'error' } | { status: 'ready'; post: Post };

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<DetailState>({ status: 'loading' });
  // Bumping this re-runs the effect below (used by "Try again").
  const [attempt, setAttempt] = useState(0);

  // The screen loads its post by id (instead of receiving the whole object),
  // so it also works when opened from a deep link like ooru://post/<id>.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const post = await fetchPostById(id);
        if (!cancelled) setState(post ? { status: 'ready', post } : { status: 'notFound' });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  };

  if (state.status === 'loading') return <LoadingState label={t('feed.loading')} />;
  if (state.status === 'notFound') return <EmptyState title={t('detail.notFoundTitle')} hint={t('detail.notFoundHint')} />;
  if (state.status === 'error') return <ErrorState title={t('detail.errorTitle')} hint={t('feed.errorHint')} onRetry={retry} />;

  const { post } = state;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          accessibilityLabel={t('post.photoOf', { title: post.title })}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <View style={styles.content}>
        <TypeBadge type={post.type} />
        <AppText style={styles.title} accessibilityRole="header">
          {post.title}
        </AppText>
        {post.price !== null ? <AppText style={styles.price}>{formatPrice(post.price, t)}</AppText> : null}
        <AppText style={styles.meta}>
          {t(`districts.${post.district}`)} · {formatTimeAgo(post.createdAt, t)}
        </AppText>
        <AppText style={styles.body}>{post.body}</AppText>
        <AppText style={styles.author}>{t('post.postedBy', { name: post.authorName })}</AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  author: {
    marginTop: spacing.md,
    color: colors.textMuted,
  },
});
