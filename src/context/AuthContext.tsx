"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authService from '@/service/authService';
import getMyProfile from '@/service/userService';
import { IUser } from "@/interface/IUser";
import LoadingSpinner from '../components/LoadingSpinner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  isLoading: boolean;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para definir cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Função para remover cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Verifica se o token é válido buscando o perfil do usuário
          const userProfile = await getMyProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Se houver erro, remove o token inválido
        authService.logout();
        removeCookie('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (cpf: string, password: string) => {
    try {
      const response = await authService.login(cpf, password);
      const userProfile = await getMyProfile();
      setUser(userProfile);
      
      // Salva o token também em cookie para o middleware
      if (response.token) {
        setCookie('authToken', response.token);
      }
      
      // Redireciona para a página original se especificada
      const redirectTo = searchParams.get('redirect') || '/home';
      router.push(redirectTo);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    removeCookie('authToken');
    setUser(null);
    router.push('/login');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    isLoading,
    login,
    logout,
  };

  // Mostra loading global enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6FFFA] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando autenticação..." />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};