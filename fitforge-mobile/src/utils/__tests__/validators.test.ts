import { validateEmail, validatePassword, validateRequired } from '../validators';

describe('validateEmail', () => {
  it('accepts a well-formed email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('rejects strings without an @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects strings without a domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with 8+ characters', () => {
    expect(validatePassword('password123')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('short')).toBe(false);
  });
});

describe('validateRequired', () => {
  it('accepts non-empty values', () => {
    expect(validateRequired('hello')).toBe(true);
  });

  it('rejects empty or whitespace-only values', () => {
    expect(validateRequired('')).toBe(false);
    expect(validateRequired('   ')).toBe(false);
  });
});
