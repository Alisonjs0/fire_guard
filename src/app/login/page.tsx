"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

// Força dynamic rendering para evitar erros de SSR
export const dynamic = 'force-dynamic';

import {
  Shield,
  Users,
  Eye,
  Wrench,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Loader2,
  FireExtinguisher
} from "lucide-react";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const authContext = hasMounted ? useAuth() : { login: async () => {} };
  const { login } = authContext;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const features = [
    {
      icon: FireExtinguisher,
      title: "Gestão de Extintores",
      description:
        "Controle completo do inventário de extintores com localização e status",
    },
    {
      icon: Eye,
      title: "Inspeções Digitais",
      description:
        "Sistema digital de inspeções com checklists e relatórios automáticos",
    },
    {
      icon: Wrench,
      title: "Manutenções",
      description:
        "Agendamento e controle de manutenções preventivas e corretivas",
    },
    {
      icon: BarChart3,
      title: "Relatórios Analíticos",
      description: "Dashboards e relatórios detalhados para tomada de decisões",
    },
  ];

  const benefits = [
    "Conformidade com normas de segurança",
    "Redução de custos operacionais",
    "Automatização de processos",
    "Histórico completo de manutenções",
    "Alertas inteligentes de vencimento",
    "Interface intuitiva e responsiva",
  ];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Tentando logar com:", cpf, password);
    if (!cpf || !password) {
      toast.error("Preencha os campos de CPF e senha.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(cpf, password);
      toast.success("Login realizado com sucesso!");
    } catch (err: any) {
      console.error("Erro no login:", err); // Adicione esta linha
      toast.error("CPF ou senha inválidos. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding and Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 to-red-800 text-white p-8 flex-col justify-between items-center">
          <div className="flex flex-col items-center w-full">
            {/* Logo */}
            <div className="flex items-center gap-2 my-8 ">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FireGuard</h1>
                <p className="text-red-100 text-lg">
                  Sistema de Gestão de Extintores
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-8 w-full">
              <div>
                <h2 className="text-xl font-semibold mb-8 text-center">
                  Recursos Principais
                </h2>
                <div className="grid gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 justify-center"
                      >
                        <div className="flex w-full max-w-md">
                          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 my-auto">
                            <Icon className="h-10 w-10 text-white" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-lg">
                              {feature.title}
                            </h3>
                            <p className="text-red-100 text-md leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 w-full">
            <div className="text-center">
              <div className="text-xl font-bold">99.9%</div>
              <div className="text-red-100 text-xs">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">500+</div>
              <div className="text-red-100 text-xs">Empresas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">24/7</div>
              <div className="text-red-100 text-xs">Suporte</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FireGuard</h1>
                <p className="text-gray-600 text-xs">
                  Sistema de Gestão de Extintores
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Bem-vindo de volta!
                </h2>
                <p className="text-gray-600 text-md">
                  Acesse sua conta para gerenciar extintores e inspeções
                </p>
              </div>

              {/* Login Form */}
              <form
                className="flex flex-col w-full max-w-lg p-4"
                onSubmit={handleLogin}
              >
                <h1 className="text-3xl font-bold mb-4 text-red-700 w-full text-center md:text-left">
                  Login
                </h1>

                <label
                  className="mb-1 font-semibold text-[#2F4858] text-md"
                  htmlFor="cpf"
                >
                  CPF:
                </label>
                <input
                  id="cpf"
                  type="text"
                  name="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="mb-3 p-3 py-4 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-md h-8"
                />

                <label
                  className="mb-1 font-semibold text-[#2F4858] text-md"
                  htmlFor="password"
                >
                  Senha:
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4 p-3 py-4 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-md h-8"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-lg transition-all duration-200 text-md ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:from-red-700 hover:to-red-800 hover:shadow-xl"
                  }`}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
              </form>

              {/* Benefits */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-md font-semibold text-gray-900 mb-2 text-center">
                  Por que escolher o FireGuard?
                </h3>
                <div className="space-y-2">
                  {benefits.slice(0, 4).map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-md text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-md font-medium text-blue-900 mb-0.5">
                      Login Seguro
                    </h4>
                    <p className="text-xs text-blue-700">
                      Sua conta é protegida por autenticação segura da
                      plataforma Lumi. Todos os dados são criptografados e
                      protegidos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-xs text-gray-500">
              <p>
                Ao fazer login, você concorda com nossos{" "}
                <a
                  href="#"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a
                  href="#"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
