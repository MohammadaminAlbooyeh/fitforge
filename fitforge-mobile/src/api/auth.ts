import { api } from './client';
import { AuthResponse, LoginInput, SignupInput } from './types';

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function signupRequest(input: SignupInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function fetchProfile(): Promise<AuthResponse['user']> {
  const { data } = await api.get('/users/me');
  return data;
}