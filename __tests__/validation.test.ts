import { hasErrors, LIMITS, toNewClassified, validateClassified, type ClassifiedForm } from '@/validation/classified';

const validForm: ClassifiedForm = {
  title: 'Honda Activa 6G, 2022',
  description: 'Pearl white, new tyres, insurance valid.',
  price: '62000',
  district: 'vijayawada',
  authorName: 'Sai Teja',
  photo: null,
};

describe('validateClassified', () => {
  it('accepts a complete form', () => {
    expect(validateClassified(validForm)).toEqual({});
  });

  it('flags every required field on an empty form', () => {
    const errors = validateClassified({ ...validForm, title: '', description: '', price: '', authorName: '' });
    expect(errors).toEqual({
      title: 'errors.titleRequired',
      description: 'errors.descriptionRequired',
      price: 'errors.priceRequired',
      authorName: 'errors.nameRequired',
    });
  });

  it('ignores surrounding whitespace when checking length', () => {
    expect(validateClassified({ ...validForm, title: '   Bike   ' }).title).toBe('errors.titleTooShort');
    expect(validateClassified({ ...validForm, authorName: '  ' }).authorName).toBe('errors.nameRequired');
  });

  it('enforces maximum lengths', () => {
    const errors = validateClassified({
      ...validForm,
      title: 'a'.repeat(LIMITS.titleMax + 1),
      description: 'a'.repeat(LIMITS.descriptionMax + 1),
      authorName: 'a'.repeat(LIMITS.nameMax + 1),
    });
    expect(errors.title).toBe('errors.titleTooLong');
    expect(errors.description).toBe('errors.descriptionTooLong');
    expect(errors.authorName).toBe('errors.nameTooLong');
  });

  it('counts Telugu text by characters', () => {
    // "బైక్ అమ్మకం" (bike for sale) is long enough even though it is only two words.
    expect(validateClassified({ ...validForm, title: 'బైక్ అమ్మకం' }).title).toBeUndefined();
  });

  it.each([
    ['0', undefined],
    ['1,20,000', undefined],
    [' 2500 ', undefined],
    ['12.50', 'errors.priceInvalid'],
    ['-5', 'errors.priceInvalid'],
    ['abc', 'errors.priceInvalid'],
    ['100000001', 'errors.priceTooHigh'],
  ])('price "%s" -> %s', (price, expected) => {
    expect(validateClassified({ ...validForm, price }).price).toBe(expected);
  });

  it('rejects photos over the size limit', () => {
    const bigPhoto = { uri: 'file:///big.jpg', mimeType: 'image/jpeg', fileSize: LIMITS.photoMaxBytes + 1 };
    expect(validateClassified({ ...validForm, photo: bigPhoto }).photo).toBe('errors.photoTooLarge');
  });
});

describe('hasErrors', () => {
  it('is true only when some field has an error', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ price: 'errors.priceInvalid' })).toBe(true);
  });
});

describe('toNewClassified', () => {
  it('trims text and turns the price into a number', () => {
    const result = toNewClassified(
      { ...validForm, title: '  Activa  ', price: '1,20,000', authorName: ' Sai ' },
      'https://x.supabase.co/a.jpg',
    );
    expect(result).toEqual({
      district: 'vijayawada',
      title: 'Activa',
      body: validForm.description,
      price: 120000,
      imageUrl: 'https://x.supabase.co/a.jpg',
      authorName: 'Sai',
    });
  });
});
