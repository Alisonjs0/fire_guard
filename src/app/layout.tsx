
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Layout from '../components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gerenciamento de Extintores - SGE',
  description: 'Sistema completo para gestão e monitoramento de extintores de incêndio',
  keywords: ['extintores', 'segurança', 'gestão', 'incêndio', 'inspeção', 'manutenção'],
  authors: [{ name: 'SGE Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={inter.className}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: { 
              background: '#363636', 
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: { 
              style: { background: '#10b981' },
              iconTheme: { primary: '#fff', secondary: '#10b981' }
            },
            error: { 
              style: { background: '#ef4444' },
              iconTheme: { primary: '#fff', secondary: '#ef4444' }
            }
          }}
        />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
