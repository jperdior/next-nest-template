'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../infrastructure/api/auth-api.client';
import type { components } from '@/shared/types/api-types';

type LoginRequest = components['schemas']['LoginRequest'];
type AuthResponse = components['schemas']['AuthResponse'];

interface UseLoginResult {
  login: (input: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for user login
 * Handles login API call and JWT token storage
 */
export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginUser = async (input: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await login(input);
      
      // Store JWT token in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: loginUser,
    isLoading,
    error,
  };
}
