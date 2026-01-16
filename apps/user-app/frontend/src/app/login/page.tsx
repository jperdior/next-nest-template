import { LoginForm } from '@/features/auth/presentation/components/LoginForm';

export const metadata = {
  title: 'Login - TestProject',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  );
}
