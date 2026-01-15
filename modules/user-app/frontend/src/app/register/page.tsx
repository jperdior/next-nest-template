import { RegisterForm } from '@/features/auth/presentation/components/RegisterForm';

export const metadata = {
  title: 'Register - TestProject',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </div>
  );
}
