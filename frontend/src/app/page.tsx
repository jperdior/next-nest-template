export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
        {/* Main Hello World */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Hello World
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 font-light">
            Welcome to Dungeonman
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">NestJS Backend</h3>
            <p className="text-sm text-gray-600">
              DDD architecture with Prisma & PostgreSQL
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Next.js Frontend</h3>
            <p className="text-sm text-gray-600">
              Clean Architecture with Tailwind CSS
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-3">🐳</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Docker Ready</h3>
            <p className="text-sm text-gray-600">
              Redis, RabbitMQ & hot reload included
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-12 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 text-green-800 font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          System Running on Ports 8080 & 8081
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {['TypeScript', 'Docker', 'Prisma', 'Traefik'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
