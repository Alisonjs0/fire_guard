"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <Shield className="h-12 w-12 text-red-600 mb-2" />
        <h1 className="text-4xl font-bold text-red-700">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 text-center mb-4">
          A página que você procura não existe ou foi movida.<br />
          Verifique o endereço ou volte para a página inicial.
        </p>
        <Link href="/" className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
