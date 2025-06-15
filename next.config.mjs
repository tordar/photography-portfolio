import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'd1tcutn9yt0mbltf.public.blob.vercel-storage.com',
            },
        ],
    },
    webpack: (config, { dev, isServer }) => {
        // Disable source maps in development mode
        if (dev) {
            config.devtool = false;
        }

        // Add the alias for the @/ path
        config.resolve.alias['@'] = path.join(__dirname, 'src');

        return config;
    },
};

export default nextConfig;

