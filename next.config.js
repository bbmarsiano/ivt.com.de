/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    // Ignore optional React email dependencies in Resend SDK
    // We use plain HTML/text strings, not React components
    // This prevents Next.js from trying to bundle @react-email/render
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-email/render': false,
      '@react-email/components': false,
    };
    return config;
  },
};

module.exports = nextConfig;
