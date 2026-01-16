'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../application/context/AuthContext';

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-400 transition-all">
            TestProject
          </h1>
        </Link>
        <nav className="flex gap-4 items-center min-h-[40px]">
          {isLoading ? null : isAuthenticated ? (
            // Logged in state
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 text-sm hidden sm:block">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-700 hover:border-red-500 hover:bg-red-500/10 rounded-md font-medium transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            // Logged out state
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 font-medium transition-colors shadow-lg shadow-blue-600/25"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
