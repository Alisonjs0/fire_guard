"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();

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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#48A9A6] text-[#2F4858]">
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12"></div>
      <div className="flex w-full md:w-1/2 bg-[#E6FFFA] items-center justify-center min-h-screen">
        <form
          className="flex flex-col w-full max-w-md p-8"
          onSubmit={handleLogin}
        >
          <h1 className="text-4xl font-bold mb-6 text-[#48A9A6] w-full text-center md:text-left">
            Login
          </h1>

          <label className="mb-2 font-semibold text-[#2F4858]" htmlFor="cpf">
            CPF:
          </label>
          <input
            id="cpf"
            type="text"
            name="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#48A9A6]"
          />

          <label className="mb-2 font-semibold text-[#2F4858]" htmlFor="password">
            Senha:
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-6 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#48A9A6]"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-[#48A9A6] text-white font-bold py-2 px-4 rounded transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#409592]"
            }`}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
