import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CreateClassifiedScreen from '../app/create';

import { createClassified, uploadPostImage } from '@/api/posts';
import { DISTRICT_STORAGE_KEY, DistrictProvider } from '@/context/DistrictContext';

jest.mock('@/api/posts', () => ({ createClassified: jest.fn(), uploadPostImage: jest.fn() }));
const mockBack = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack }) }));

const mockCreateClassified = jest.mocked(createClassified);
const mockUploadPostImage = jest.mocked(uploadPostImage);

async function renderForm() {
  await render(<CreateClassifiedScreen />, { wrapper: DistrictProvider });
  return screen.findByRole('button', { name: 'Post ad' });
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), '  Honda Activa 6G, 2022 ');
  await user.type(screen.getByLabelText('Description'), 'Pearl white, new tyres.');
  await user.type(screen.getByLabelText('Price (₹)'), '62,000');
  await user.type(screen.getByLabelText('Your name'), 'Sai Teja');
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

describe('Create classified screen', () => {
  it('shows an error for every required field and does not submit an empty form', async () => {
    const user = userEvent.setup();
    const submit = await renderForm();

    await user.press(submit);

    expect(screen.getByText('Enter a title.')).toBeOnTheScreen();
    expect(screen.getByText('Enter a description.')).toBeOnTheScreen();
    expect(screen.getByText("Enter a price (0 if it's free).")).toBeOnTheScreen();
    expect(screen.getByText('Enter your name.')).toBeOnTheScreen();
    expect(screen.getByText('Please fix the fields marked in red.')).toBeOnTheScreen();
    expect(mockCreateClassified).not.toHaveBeenCalled();
  });

  it('does not show errors before the first submit, then updates them live', async () => {
    const user = userEvent.setup();
    const submit = await renderForm();

    await user.type(screen.getByLabelText('Title'), 'Bike');
    expect(screen.queryByText('Title must be at least 5 characters.')).not.toBeOnTheScreen();

    await user.press(submit);
    expect(screen.getByText('Title must be at least 5 characters.')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Title'), ' for sale');
    expect(screen.queryByText('Title must be at least 5 characters.')).not.toBeOnTheScreen();
  });

  it('rejects a price that is not a whole number', async () => {
    const user = userEvent.setup();
    const submit = await renderForm();

    await user.type(screen.getByLabelText('Price (₹)'), '12.50');
    await user.press(submit);

    expect(screen.getByText('Use whole rupees in digits only, like 2500.')).toBeOnTheScreen();
  });

  it('submits a valid ad in the current district, then goes back', async () => {
    await AsyncStorage.setItem(DISTRICT_STORAGE_KEY, 'vijayawada');
    mockCreateClassified.mockResolvedValue({} as never);
    const user = userEvent.setup();
    const submit = await renderForm();

    await fillValidForm(user);
    await user.press(submit);

    expect(mockUploadPostImage).not.toHaveBeenCalled(); // no photo picked
    expect(mockCreateClassified).toHaveBeenCalledWith({
      district: 'vijayawada',
      title: 'Honda Activa 6G, 2022',
      body: 'Pearl white, new tyres.',
      price: 62000,
      imageUrl: null,
      authorName: 'Sai Teja',
    });
    expect(Alert.alert).toHaveBeenCalledWith('Ad posted', 'Your ad is now live in Vijayawada.');
    expect(mockBack).toHaveBeenCalled();
  });

  it('keeps the form and shows a message when posting fails', async () => {
    mockCreateClassified.mockRejectedValue(new Error('Network request failed'));
    const user = userEvent.setup();
    const submit = await renderForm();

    await fillValidForm(user);
    await user.press(submit);

    expect(
      await screen.findByText("Couldn't post your ad. Check your internet connection and try again."),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Title')).toHaveDisplayValue('  Honda Activa 6G, 2022 ');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
