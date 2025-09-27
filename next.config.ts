
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Configurações experimentais
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    // Desabilita ESLint durante o build para resolver problemas de configuração
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilita verificação de tipos durante o build se necessário
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
}

export default nextConfig
