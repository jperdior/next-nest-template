import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/features/auth/application/context/AuthContext';
import { Header } from '@/features/auth/presentation/components/Header';

export const metadata: Metadata = {
  title: 'TestProject',
  description: 'Full-stack TypeScript template application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
              Built with Next.js, NestJS, and TypeScript
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
