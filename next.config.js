/** @type {import('next').NextConfig} */
const nextConfig = {
  // @resvg/resvg-js loads a native .node binary at runtime; webpack can't
  // bundle it. Mark it external so Next leaves the require alone.
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lhxbobygkrfdzfrymqzl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
