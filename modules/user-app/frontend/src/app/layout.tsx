import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';

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
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors">
                TestProject
              </h1>
            </Link>
            <nav className="flex gap-3">
              <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
                Register
              </Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-border mt-auto">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
            Built with Next.js, NestJS, and TypeScript
          </div>
        </footer>
      </body>
    </html>
  );
}
