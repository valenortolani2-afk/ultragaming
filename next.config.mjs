/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos de los productos subidos desde /admin a Vercel Blob
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }]
  }
};

export default nextConfig;
