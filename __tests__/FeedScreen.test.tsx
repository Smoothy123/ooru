import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';

import FeedScreen from '../app/index';
import { fakeFetchPosts, hyderabadBike, hyderabadFlat, hyderabadNews, vijayawadaScooter } from '../test-utils/helpers';

import { fetchPosts } from '@/api/posts';
import { saveFeedCache } from '@/cache/feedCache';
import { DISTRICT_STORAGE_KEY, DistrictProvider } from '@/context/DistrictContext';

// Replace the network layer and the router; everything else (hook, cache,
// context, components, translations) runs for real.
jest.mock('@/api/posts', () => ({ fetchPosts: jest.fn() }));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: jest.fn(),
}));

const mockFetchPosts = jest.mocked(fetchPosts);

async function renderFeed() {
  await render(<FeedScreen />, { wrapper: DistrictProvider });
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockFetchPosts.mockImplementation(fakeFetchPosts);
});

describe('FeedScreen', () => {
  it('renders the posts for the default district', async () => {
    await renderFeed();

    expect(await screen.findByText(hyderabadNews.title)).toBeOnTheScreen();
    expect(screen.getByText(hyderabadBike.title)).toBeOnTheScreen();
    expect(screen.getByText(hyderabadFlat.title)).toBeOnTheScreen(); // Telugu post
    expect(screen.getByText('₹1,35,000')).toBeOnTheScreen();
    expect(mockFetchPosts).toHaveBeenCalledWith({ district: 'hyderabad', filter: 'all', cursor: null });
  });

  it('filters to News when the News tab is pressed', async () => {
    const user = userEvent.setup();
    await renderFeed();
    await screen.findByText(hyderabadBike.title);

    await user.press(screen.getByRole('tab', { name: 'News' }));

    expect(await screen.findByText(hyderabadNews.title)).toBeOnTheScreen();
    expect(screen.queryByText(hyderabadBike.title)).not.toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'News' })).toBeSelected();
    expect(mockFetchPosts).toHaveBeenLastCalledWith({ district: 'hyderabad', filter: 'news', cursor: null });
  });

  it('switches district and remembers the choice', async () => {
    const user = userEvent.setup();
    await renderFeed();
    await screen.findByText(hyderabadNews.title);

    await user.press(screen.getByRole('button', { name: /District: Hyderabad/ }));
    await user.press(screen.getByRole('radio', { name: 'Vijayawada' }));

    expect(await screen.findByText(vijayawadaScooter.title)).toBeOnTheScreen();
    expect(screen.queryByText(hyderabadNews.title)).not.toBeOnTheScreen();
    expect(await AsyncStorage.getItem(DISTRICT_STORAGE_KEY)).toBe('vijayawada');
  });

  it('starts in the district saved on a previous launch', async () => {
    await AsyncStorage.setItem(DISTRICT_STORAGE_KEY, 'vijayawada');
    await renderFeed();

    expect(await screen.findByText(vijayawadaScooter.title)).toBeOnTheScreen();
    expect(mockFetchPosts).toHaveBeenCalledTimes(1); // never fetched Hyderabad first
  });

  it('shows an empty state when a district has no posts', async () => {
    mockFetchPosts.mockResolvedValue({ posts: [], nextCursor: null });
    await renderFeed();

    expect(await screen.findByText('Nothing here yet')).toBeOnTheScreen();
  });

  it('opens the detail screen when a post is pressed', async () => {
    const user = userEvent.setup();
    await renderFeed();

    await user.press(await screen.findByRole('button', { name: new RegExp(hyderabadBike.title) }));

    expect(mockPush).toHaveBeenCalledWith(`/post/${hyderabadBike.id}`);
  });

  describe('when the network fails', () => {
    beforeEach(() => {
      mockFetchPosts.mockRejectedValue(new Error('Network request failed'));
    });

    it('shows the saved feed with an offline banner', async () => {
      await saveFeedCache('hyderabad', 'all', [hyderabadBike]);
      await renderFeed();

      expect(await screen.findByText('No connection')).toBeOnTheScreen();
      expect(screen.getByText('Showing posts saved just now. Pull down to try again.')).toBeOnTheScreen();
      expect(screen.getByText(hyderabadBike.title)).toBeOnTheScreen();
    });

    it('shows an error with Try again when nothing is saved', async () => {
      const user = userEvent.setup();
      await renderFeed();

      expect(await screen.findByText("Couldn't load posts")).toBeOnTheScreen();

      mockFetchPosts.mockImplementation(fakeFetchPosts); // back online
      await user.press(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText(hyderabadNews.title)).toBeOnTheScreen();
      expect(screen.queryByText('No connection')).not.toBeOnTheScreen();
    });
  });
});
