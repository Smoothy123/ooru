import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen } from '@testing-library/react-native';

import PostDetailScreen from '../app/post/[id]';
import { hyderabadBike, hyderabadFlat } from '../test-utils/helpers';

import { fetchPostById } from '@/api/posts';
import { findCachedPost, readFeedCache, saveFeedCache } from '@/cache/feedCache';

jest.mock('@/api/posts', () => ({ fetchPostById: jest.fn() }));
jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: '7d0c5b1e-0002-4a51-9a1b-000000000002' }) }));

const mockFetchPostById = jest.mocked(fetchPostById);

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('feedCache', () => {
  it('round-trips a feed snapshot with the time it was saved', async () => {
    await saveFeedCache('hyderabad', 'classified', [hyderabadBike]);

    const cached = await readFeedCache('hyderabad', 'classified');
    expect(cached?.posts).toEqual([hyderabadBike]);
    expect(Date.parse(cached!.savedAt)).not.toBeNaN();
    expect(await readFeedCache('hyderabad', 'news')).toBeNull(); // separate key per filter
  });

  it('treats a corrupted entry as "nothing saved"', async () => {
    await AsyncStorage.setItem('ooru:feed:v1:hyderabad:all', '{not json');
    expect(await readFeedCache('hyderabad', 'all')).toBeNull();
  });

  it('finds a post in any saved feed', async () => {
    await saveFeedCache('hyderabad', 'all', [hyderabadFlat, hyderabadBike]);
    expect(await findCachedPost(hyderabadBike.id)).toEqual(hyderabadBike);
    expect(await findCachedPost('missing')).toBeNull();
  });
});

describe('Post detail screen', () => {
  it('shows the post from the network', async () => {
    mockFetchPostById.mockResolvedValue(hyderabadBike);
    await render(<PostDetailScreen />);

    expect(await screen.findByText(hyderabadBike.title)).toBeOnTheScreen();
    expect(screen.getByText('Posted by Ravi K.')).toBeOnTheScreen();
    expect(screen.queryByText('No connection')).not.toBeOnTheScreen();
  });

  it('shows the saved copy with an offline banner when the network fails', async () => {
    await saveFeedCache('hyderabad', 'all', [hyderabadBike]);
    mockFetchPostById.mockRejectedValue(new Error('Network request failed'));
    await render(<PostDetailScreen />);

    expect(await screen.findByText(hyderabadBike.title)).toBeOnTheScreen();
    expect(screen.getByText('No connection')).toBeOnTheScreen();
    expect(screen.getByText('Showing a saved copy of this post.')).toBeOnTheScreen();
  });

  it('shows an error with Try again when offline and the post was never saved', async () => {
    mockFetchPostById.mockRejectedValue(new Error('Network request failed'));
    await render(<PostDetailScreen />);

    expect(await screen.findByText("Couldn't load this post")).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
  });
});
