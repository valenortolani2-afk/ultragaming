/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos de las publicaciones subidas a Vercel Blob
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }]
  }
};

export default nextConfig;
