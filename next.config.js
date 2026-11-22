/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      // "What we print" and the custom print page were folded into /custom.
      { source: '/services', destination: '/custom', permanent: true },
      // Next passes the original query through, so ?type=golf is kept.
      { source: '/shop/custom-print', destination: '/custom?start=map', permanent: true },
    ];
  },
};

module.exports = nextConfig;
