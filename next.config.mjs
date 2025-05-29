/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages configuration
  serverExternalPackages: ['mongodb'],
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'eurotours',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  }
};

export default nextConfig
