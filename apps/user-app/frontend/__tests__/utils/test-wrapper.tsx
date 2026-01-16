import { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/application/context/AuthContext';

/**
 * Test wrapper that provides all necessary context providers for testing.
 */
export function TestWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

/**
 * Custom render options for wrapping components with providers.
 */
export const testWrapperOptions = {
  wrapper: TestWrapper,
};
