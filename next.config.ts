/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['d1tcutn9yt0mbltf.public.blob.vercel-storage.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.vercel-storage.com',
            },
        ],
    },
}

module.exports = nextConfig