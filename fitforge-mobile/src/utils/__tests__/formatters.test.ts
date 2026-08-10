import { formatWeight, formatCalories, toISODate } from '../formatters';

describe('formatWeight', () => {
  it('formats a numeric weight with unit', () => {
    expect(formatWeight(72.5)).toBe('72.5 kg');
  });

  it('returns an em dash for null or undefined', () => {
    expect(formatWeight(null)).toBe('—');
    expect(formatWeight(undefined)).toBe('—');
  });
});

describe('formatCalories', () => {
  it('rounds and appends kcal', () => {
    expect(formatCalories(450.4)).toBe('450 kcal');
    expect(formatCalories(450.6)).toBe('451 kcal');
  });
});

describe('toISODate', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-08-10T12:00:00Z'))).toBe('2026-08-10');
  });
});
