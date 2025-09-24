'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {LayoutDashboard, Shield, Eye, Wrench, Bell, FileText, Menu, X, User, Settings, LogOut, House, FireExtinguisher} from 'lucide-react'
// import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  // Usuário mock para testes
  const user = {
    email: 'usuario@exemplo.com',
    nome: 'Usuário Teste'
  }
  const signOut = () => {
    // Função mock de logout
    alert('Logout realizado!')
  }

  const navigation = [
    { name: "Home", href: "/", icon: House },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Extintores', href: '/extintores', icon: FireExtinguisher },
    { name: 'Inspeções', href: '/inspecoes', icon: Eye },
    { name: 'Manutenções', href: '/manutencoes', icon: Wrench },
    { name: 'Alertas', href: '/alertas', icon: Bell },
    { name: 'Relatórios', href: '/relatorios', icon: FileText },
  ]

  const isActive = (href: string) => pathname === href

  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen  flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link className="flex items-center gap-3" href={"/"}>
            <Shield className="h-8 w-8 text-red-600"/>
            <span className="text-xl font-bold text-gray-900">FireGuard</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        {/* User info */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 w-full p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">{'Usuário'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings size={16} />
                    Configurações
                  </button>
                  <button 
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
  <div className="flex-1 flex flex-col w-full">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">FireGuard</span>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
        {/* Page content */}
          <main className="flex-1 flex justify-center">
          <div className="w-full max-w-7xl px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
