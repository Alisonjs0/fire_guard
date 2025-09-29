/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Força o reprocessamento do CSS em desenvolvimento
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['images.pexels.com', 'lumi.new'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lumi.new',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuração específica para garantir que o CSS seja processado
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Força o reload do CSS em desenvolvimento
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig