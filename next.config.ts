import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Partial Prerendering: static shell for content + streamed personal data.
  cacheComponents: true,
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone server for the Docker image (Yandex Cloud Serverless Containers).
  output: "standalone",
  // Content is read from disk at request time too (bots get a full render),
  // so the files must ship with the standalone server.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./drizzle/**/*", "./assets/**/*"],
  },
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
