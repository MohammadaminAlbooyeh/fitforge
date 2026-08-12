const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}