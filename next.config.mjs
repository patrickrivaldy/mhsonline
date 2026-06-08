/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'arzbbnxzivyrdtfoxouu.supabase.co', // Ganti dengan ID Supabase kalian
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com', // Izinkan Google Drive
      }
    ],
  },
};

export default nextConfig;