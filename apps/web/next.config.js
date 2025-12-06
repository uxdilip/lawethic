/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@lawethic/appwrite'],
    images: {
        domains: ['cloud.appwrite.io'],
    },
};

module.exports = nextConfig;
