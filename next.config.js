/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config) => {
        config.resolve.fallback = { fs: false };
        return config;
    },
    experimental: {
        optimizeCss: true
    },
    transpilePackages: ['@radix-ui/react-icons'],
    images: {
        domains: ['images.unsplash.com'],
    },
};

module.exports = nextConfig;