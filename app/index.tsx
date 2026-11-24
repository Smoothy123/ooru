import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { DistrictPicker } from '@/components/DistrictPicker';
import { FilterTabs } from '@/components/FilterTabs';
import { EmptyState, ErrorState, LoadingState } from '@/components/ListStates';
import { PostCard } from '@/components/PostCard';
import { colors, spacing } from '@/constants/theme';
import { useDistrict } from '@/context/DistrictContext';
import { useFeed } from '@/hooks/useFeed';
import type { FeedFilter, Post } from '@/types/post';

// Defined outside the component so FlatList gets the same function every render.
const keyExtractor = (post: Post) => post.id;
const Separator = () => <View style={styles.separator} />;

export default function FeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { district, setDistrict } = useDistrict();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const feed = useFeed(district, filter);

  // Stable callbacks so memoized PostCards don't re-render on every feed update.
  const openPost = useCallback((id: string) => router.push(`/post/${id}`), [router]);
  const renderItem = useCallback(({ item }: { item: Post }) => <PostCard post={item} onPress={openPost} />, [openPost]);

  const districtName = t(`districts.${district}`);

  let content;
  if (feed.status === 'loading') {
    content = <LoadingState label={t('feed.loading')} />;
  } else if (feed.status === 'error' && feed.posts.length === 0) {
    content = <ErrorState title={t('feed.errorTitle')} hint={t('feed.errorHint')} onRetry={feed.retry} />;
  } else {
    content = (
      <FlatList
        data={feed.posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
        ListEmptyComponent={
          <EmptyState title={t('feed.emptyTitle')} hint={t('feed.emptyHint', { district: districtName })} />
        }
        ListFooterComponent={
          <ListFooter loadingMore={feed.status === 'loadingMore'} failed={feed.loadMoreFailed} onRetry={feed.loadMore} />
        }
        refreshControl={
          <RefreshControl
            refreshing={feed.status === 'refreshing'}
            onRefresh={feed.refresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={feed.loadMore}
        onEndReachedThreshold={0.5}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.controls}>
        <DistrictPicker value={district} onChange={setDistrict} />
        <FilterTabs value={filter} onChange={setFilter} />
      </View>
      {content}
    </View>
  );
}

function ListFooter({ loadingMore, failed, onRetry }: { loadingMore: boolean; failed: boolean; onRetry: () => void }) {
  const { t } = useTranslation();
  if (loadingMore) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} accessibilityLabel={t('feed.loadingMore')} />
      </View>
    );
  }
  if (failed) {
    return (
      <View style={styles.footer}>
        <AppText style={styles.footerText}>{t('feed.loadMoreError')}</AppText>
        <AppButton title={t('common.retry')} variant="secondary" onPress={onRetry} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
  },
});
