/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos que todavía estén en Vercel Blob (subidas antes de la mudanza a Cloudinary).
    // Las de Cloudinary no pasan por acá: app/Foto.js se las pide achicadas a Cloudinary.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }]
  }
};

export default nextConfig;
