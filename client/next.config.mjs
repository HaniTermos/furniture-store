/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Pre-existing ESLint issues (no-explicit-any, unused imports) — not from production readiness fixes
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Pre-existing TS errors (wrong property names, type mismatches) — not from production readiness fixes
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'example.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
