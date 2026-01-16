'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../infrastructure/api/auth-api.client';
import { useAuth } from '../context/AuthContext';
import type { components } from '@/shared/types/api-types';

type RegisterRequest = components['schemas']['RegisterRequest'];
type AuthResponse = components['schemas']['AuthResponse'];

interface UseRegisterResult {
  register: (input: RegisterRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for user registration
 * Handles registration API call and JWT token storage
 */
export function useRegister(): UseRegisterResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const registerUser = async (input: RegisterRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await register(input);
      
      // Store JWT token in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Refresh auth state so header updates
      refreshAuth();
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      // Error is encapsulated in state - callers should check the error property
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register: registerUser,
    isLoading,
    error,
  };
}
