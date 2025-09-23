"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  FileText,
  Calendar,
  ChevronRight,
  House,
  FireExtinguisher
} from "lucide-react";
import MainHeader from "@/components/MainHeader";

const Dashboard: React.FC = () => {
  const modules = [
    {
      title: "Extintores",
      description: "Cadastro e gerenciamento de extintores",
      icon: FireExtinguisher,
      href: "/extintores",
      color: "bg-primary-500",
      stats: "45 Ativos",
    },
    {
      title: "Inspeções",
      description: "Checklist digital e relatórios",
      icon: ClipboardCheck,
      href: "/inspecoes",
      color: "bg-blue-500",
      stats: "12 Este mês",
    },
    {
      title: "Manutenções",
      description: "Programação e histórico",
      icon: Settings,
      href: "/manutencoes",
      color: "bg-green-500",
      stats: "3 Agendadas",
    },
    {
      title: "Alertas",
      description: "Vencimentos e não conformidades",
      icon: AlertTriangle,
      href: "/alertas",
      color: "bg-orange-500",
      stats: "2 Urgentes",
    },
    {
      title: "Relatórios",
      description: "Análises e exportações",
      icon: BarChart3,
      href: "/relatorios",
      color: "bg-purple-500",
      stats: "PDF/Excel",
    },
    {
      title: "Usuários",
      description: "Gestão de perfis e permissões",
      icon: Users,
      href: "/usuarios",
      color: "bg-indigo-500",
      stats: "8 Ativos",
    },
  ];

  const quickStats = [
    { label: "Total de Extintores", value: "45", change: "+2", trend: "up" },
    { label: "Conformes", value: "38", change: "84%", trend: "up" },
    { label: "Não Conformes", value: "5", change: "11%", trend: "down" },
    { label: "Vencidos", value: "2", change: "4%", trend: "down" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <MainHeader
        icon={<House className="text-red-600" />}
        textHeader="SGE"
        subtitle="Sistema de Gerenciamento de Extintores"
      >
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FileText className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">A</span>
          </div>
        </div>
      </MainHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao SGE
          </h2>
          <p className="text-gray-600 text-lg">
            Gerencie seus extintores de forma eficiente e mantenha a segurança
            em dia
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={module.href}>
                <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {module.stats}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atividades Recentes
            </h3>
            <div className="space-y-3">
              {[
                {
                  action: "Inspeção realizada",
                  item: "EXT-001",
                  time: "2 horas atrás",
                  status: "success",
                },
                {
                  action: "Manutenção agendada",
                  item: "EXT-015",
                  time: "5 horas atrás",
                  status: "info",
                },
                {
                  action: "Alerta de vencimento",
                  item: "EXT-023",
                  time: "1 dia atrás",
                  status: "warning",
                },
                {
                  action: "Extintor cadastrado",
                  item: "EXT-045",
                  time: "2 dias atrás",
                  status: "success",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : activity.status === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.item}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
