import { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@/constants/theme';
import type { Post } from '@/types/post';
import { formatPrice, formatTimeAgo } from '@/utils/format';

import { AppText } from './AppText';
import { TypeBadge } from './TypeBadge';

interface Props {
  post: Post;
  /** Receives the id, so the parent can pass one stable callback to every card. */
  onPress: (id: string) => void;
}

function PostCardComponent({ post, onPress }: Props) {
  const { t } = useTranslation();
  const price = post.price !== null ? formatPrice(post.price, t) : null;
  const timeAgo = formatTimeAgo(post.createdAt, t);

  // One spoken summary for screen readers instead of five separate text nodes.
  const a11yLabel = [t(`postType.${post.type}`), post.title, price, post.authorName, timeAgo]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => onPress(post.id)}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={t('post.openHint')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <TypeBadge type={post.type} />
        <AppText style={styles.title} numberOfLines={2}>
          {post.title}
        </AppText>
        <AppText style={styles.body} numberOfLines={2}>
          {post.body}
        </AppText>
        <View style={styles.footer}>
          {price ? <AppText style={styles.price}>{price}</AppText> : null}
          <AppText style={styles.meta} numberOfLines={1}>
            {post.authorName} · {timeAgo}
          </AppText>
        </View>
      </View>
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.thumbnail}
          accessibilityIgnoresInvertColors
          accessible={false}
        />
      ) : null}
    </Pressable>
  );
}

// memo: FlatList re-renders when new pages arrive; unchanged cards skip re-rendering
// because `post` objects and the `onPress` callback keep the same identity.
export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footer: {
    marginTop: spacing.xs,
    gap: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
});
