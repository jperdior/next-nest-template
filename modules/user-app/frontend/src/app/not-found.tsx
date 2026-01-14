import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        {/* 404 Error */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>

        {/* Animated Icon */}
        <div className="text-8xl animate-bounce">
          🗺️
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <span>←</span>
          Back to Home
        </Link>

        {/* Helpful Message */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Try starting from the home page or check the URL for typos.
          </p>
        </div>
      </div>
    </div>
  );
}
