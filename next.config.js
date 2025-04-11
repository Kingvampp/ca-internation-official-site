const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Disable TypeScript type checking for deployment
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors for production build
    ignoreBuildErrors: true,
  },
  // Disable ESLint checking for deployment
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors for production build
    ignoreDuringBuilds: true,
  },
  // Improve error handling
  onDemandEntries: {
    // Keep the pages in memory longer during development
    maxInactiveAge: 60 * 60 * 1000,
    // Show more detailed error messages
    pagesBufferLength: 5,
  },
  // Handle Node.js modules in browser environment
  webpack: (config, { isServer }) => {
    // Only apply these settings in the browser builds
    if (!isServer) {
      // Ignore server-only modules when bundling for client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
        http: false,
        https: false,
        path: false,
        stream: false,
        os: false,
        zlib: false,
        crypto: false,
      };
      
      // Add explicit rule for handling node: protocol imports
      config.module.rules.push({
        test: /node:/,
        use: [{ 
          loader: path.resolve('./utils/node-loader.js')
        }],
      });
      
      // Specifically ignore firebase-admin in client bundles
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
        'firebase-admin/app': false,
        'firebase-admin/auth': false,
        'firebase-admin/firestore': false,
        'firebase-admin/storage': false,
      };
    }
    
    return config;
  },
  // Fixed i18n configuration
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  // Allow more time for static generation to complete
  staticPageGenerationTimeout: 180,
  // Exclude problematic paths from trace collection
  experimental: {
    // Include only relevant directories to reduce trace complexity
    outputFileTracingIncludes: {
      '/**': ['./public/**/*', './app/**/*', './components/**/*'],
    },
    // Specifically exclude directories that might cause recursion
    outputFileTracingExcludes: {
      '/**': [
        './node_modules/sharp/**/*',
        './.git/**/*',
        './.next/**/*',
        './.vercel/**/*',
        './scripts/**/*',
        './tests/**/*',
      ],
    },
    scrollRestoration: true
  },
}

module.exports = withBundleAnalyzer(nextConfig); 