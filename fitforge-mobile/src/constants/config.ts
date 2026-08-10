export const APP_NAME = 'FitForge';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const STORAGE_KEYS = {
  authToken: 'fitforge.auth.token',
} as const;