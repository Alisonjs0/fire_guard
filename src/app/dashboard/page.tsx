"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  TrendingUp,
  Calendar,
  MapPin,
  Bell,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Building,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useCRUD } from "../../hooks/useCRUD";
import {
  Extintor,
  Inspecao,
  Manutencao,
  Unidade,
  DashboardStats,
} from "../../types";
import {
  format,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import MainHeader from "@/components/MainHeader";

const Dashboard: React.FC = () => {
  const { data: extintores } = useCRUD<Extintor>("extintores");
  const { data: inspecoes } = useCRUD<Inspecao>("inspecoes");
  const { data: manutencoes } = useCRUD<Manutencao>("manutencoes");
  const { data: unidades } = useCRUD<Unidade>("unidades");

  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [stats, setStats] = useState<DashboardStats>({
    totalExtintores: 0,
    extintoresConformes: 0,
    extintoresVencidos: 0,
    inspecoesMes: 0,
    manutencoesPendentes: 0,
  });

  useEffect(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const extintoresVencidos = extintores.filter((ext) =>
      isBefore(new Date(ext.dataValidade), now)
    ).length;

    const extintoresConformes = extintores.filter(
      (ext) => ext.status === "conforme"
    ).length;

    const inspecoesMes = inspecoes.filter((insp) => {
      const dataInsp = new Date(insp.dataInspecao);
      return dataInsp >= startOfCurrentMonth && dataInsp <= endOfCurrentMonth;
    }).length;

    const manutencoesPendentes = manutencoes.filter(
      (man) => man.status === "agendada" || man.status === "em_andamento"
    ).length;

    setStats({
      totalExtintores: extintores.length,
      extintoresConformes,
      extintoresVencidos,
      inspecoesMes,
      manutencoesPendentes,
    });
  }, [extintores, inspecoes, manutencoes]);

  const extintoresProximosVencimento = extintores.filter((ext) => {
    const dataValidade = new Date(ext.dataValidade);
    const proximoMes = addMonths(new Date(), 1);
    return (
      isAfter(dataValidade, new Date()) && isBefore(dataValidade, proximoMes)
    );
  });

  const ultimasInspecoes = inspecoes
    .sort(
      (a, b) =>
        new Date(b.dataInspecao).getTime() - new Date(a.dataInspecao).getTime()
    )
    .slice(0, 5);

  const getStatusPercentage = (status: string) => {
    if (extintores.length === 0) return 0;
    return Math.round(
      (extintores.filter((e) => e.status === status).length /
        extintores.length) *
        100
    );
  };

  const getUnidadeNome = (unidadeId: string) => {
    const unidade = unidades.find((u) => u._id === unidadeId);
    return unidade?.nome || "Unidade não encontrada";
  };

  const getExtintorNumero = (extintorId: string) => {
    const extintor = extintores.find((e) => e._id === extintorId);
    return extintor?.numeroIdentificacao || "N/A";
  };

  const alertasCriticos = [
    ...extintoresProximosVencimento.map((ext) => ({
      id: ext._id,
      tipo: "vencimento",
      titulo: `Extintor ${ext.numeroIdentificacao} próximo ao vencimento`,
      descricao: `Vence em ${format(new Date(ext.dataValidade), "dd/MM/yyyy")}`,
      urgencia: "alta" as const,
    })),
    ...extintores
      .filter((e) => e.status === "vencido")
      .map((ext) => ({
        id: ext._id,
        tipo: "vencido",
        titulo: `Extintor ${ext.numeroIdentificacao} vencido`,
        descricao: `Venceu em ${format(
          new Date(ext.dataValidade),
          "dd/MM/yyyy"
        )}`,
        urgencia: "critica" as const,
      })),
    ...manutencoes
      .filter((m) => m.status === "agendada")
      .map((man) => ({
        id: man._id,
        tipo: "manutencao",
        titulo: `Manutenção agendada`,
        descricao: `${man.tipo} - ${format(
          new Date(man.dataAgendada),
          "dd/MM/yyyy"
        )}`,
        urgencia: "media" as const,
      })),
  ];

  const estatisticasAvancadas = [
    {
      titulo: "Taxa de Conformidade",
      valor: `${
        Math.round((stats.extintoresConformes / stats.totalExtintores) * 100) ||
        0
      }%`,
      variacao: "+5%",
      tendencia: "up",
      cor: "green",
    },
    {
      titulo: "Tempo Médio de Inspeção",
      valor: "15 min",
      variacao: "-2 min",
      tendencia: "down",
      cor: "blue",
    },
    {
      titulo: "Custo Médio Manutenção",
      valor: "R$ 85",
      variacao: "+R$ 5",
      tendencia: "up",
      cor: "orange",
    },
    {
      titulo: "Unidades Ativas",
      valor: unidades.filter((u) => u.ativo).length.toString(),
      variacao: "0",
      tendencia: "stable",
      cor: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header aprimorado */}
      <MainHeader
        icon={<Shield className="text-red-600" />}
        textHeader="Dashboard de Controle"
        subtitle={`Sistema de Gerenciamento de Extintores ${format(
          new Date(),
          "dd/MM/yyyy",
          { locale: ptBR }
        )}`}
        showButton={true}
        buttonText="Exportar"
        buttonIcon={<Download className="w-4 h-4" />}
      >
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
        </div>
      </MainHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas críticos */}
        {alertasCriticos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">
                    Alertas Críticos
                  </h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {alertasCriticos.length}
                  </span>
                </div>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Ver todos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertasCriticos.slice(0, 3).map((alerta) => (
                  <div
                    key={alerta.id}
                    className="bg-white rounded-lg p-4 border border-red-100"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          alerta.urgencia === "critica"
                            ? "bg-red-500"
                            : alerta.urgencia === "alta"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {alerta.titulo}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          {alerta.descricao}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cards de estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              titulo: "Total de Extintores",
              valor: stats.totalExtintores,
              icon: Shield,
              cor: "blue",
              descricao: "Equipamentos cadastrados",
            },
            {
              titulo: "Conformes",
              valor: stats.extintoresConformes,
              icon: CheckCircle,
              cor: "green",
              descricao: `${getStatusPercentage("conforme")}% do total`,
            },
            {
              titulo: "Vencidos",
              valor: stats.extintoresVencidos,
              icon: AlertTriangle,
              cor: "red",
              descricao: "Requer ação imediata",
            },
            {
              titulo: "Inspeções (Mês)",
              valor: stats.inspecoesMes,
              icon: Eye,
              cor: "purple",
              descricao: "Realizadas este mês",
            },
            {
              titulo: "Manutenções Pendentes",
              valor: stats.manutencoesPendentes,
              icon: Wrench,
              cor: "orange",
              descricao: "Agendadas/Em andamento",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.titulo}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.valor}
                  </p>
                  <p className="text-xs text-gray-500">{stat.descricao}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.cor}-100`}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.cor}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estatísticas avançadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {estatisticasAvancadas.map((stat, index) => (
            <div
              key={stat.titulo}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  {stat.titulo}
                </h4>
                <TrendingUp
                  className={`w-4 h-4 ${
                    stat.tendencia === "up"
                      ? "text-green-500"
                      : stat.tendencia === "down"
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.valor}
                </span>
                <span
                  className={`text-sm font-medium ${
                    stat.tendencia === "up"
                      ? "text-green-600"
                      : stat.tendencia === "down"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.variacao}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Gráfico de status dos extintores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Status dos Extintores
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  status: "conforme",
                  label: "Conformes",
                  color: "green",
                  count: extintores.filter((e) => e.status === "conforme")
                    .length,
                },
                {
                  status: "nao_conforme",
                  label: "Não Conformes",
                  color: "red",
                  count: extintores.filter((e) => e.status === "nao_conforme")
                    .length,
                },
                {
                  status: "vencido",
                  label: "Vencidos",
                  color: "orange",
                  count: extintores.filter((e) => e.status === "vencido")
                    .length,
                },
                {
                  status: "manutencao",
                  label: "Em Manutenção",
                  color: "blue",
                  count: extintores.filter((e) => e.status === "manutencao")
                    .length,
                },
              ].map((item) => (
                <div key={item.status} className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-${item.color}-100 flex items-center justify-center mb-3`}
                  >
                    <span
                      className={`text-2xl font-bold text-${item.color}-600`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getStatusPercentage(item.status)}%
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de progresso visual */}
            <div className="mt-6">
              <div className="flex rounded-full h-3 bg-gray-200 overflow-hidden">
                <div
                  className="bg-green-500 transition-all duration-1000"
                  style={{ width: `${getStatusPercentage("conforme")}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-1000"
                  style={{ width: `${getStatusPercentage("nao_conforme")}%` }}
                />
                <div
                  className="bg-orange-500 transition-all duration-1000"
                  style={{ width: `${getStatusPercentage("vencido")}%` }}
                />
                <div
                  className="bg-blue-500 transition-all duration-1000"
                  style={{ width: `${getStatusPercentage("manutencao")}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Alertas de vencimento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Próximos Vencimentos
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>

            {extintoresProximosVencimento.length > 0 ? (
              <div className="space-y-4">
                {extintoresProximosVencimento.slice(0, 5).map((extintor) => (
                  <div
                    key={extintor._id}
                    className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {extintor.numeroIdentificacao}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getUnidadeNome(extintor.unidadeId)}
                      </p>
                      <p className="text-xs text-yellow-700 font-medium">
                        Vence:{" "}
                        {format(new Date(extintor.dataValidade), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}

                {extintoresProximosVencimento.length > 5 && (
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
                    Ver mais {extintoresProximosVencimento.length - 5} itens
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Nenhum extintor próximo ao vencimento
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Últimas inspeções e atividades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Últimas Inspeções
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>

            {ultimasInspecoes.length > 0 ? (
              <div className="space-y-4">
                {ultimasInspecoes.map((inspecao) => (
                  <div
                    key={inspecao._id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-full mr-4 flex-shrink-0 ${
                        inspecao.resultado === "conforme"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Extintor {getExtintorNumero(inspecao.extintorId)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(inspecao.dataInspecao),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          inspecao.resultado === "conforme"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inspecao.resultado === "conforme"
                          ? "Conforme"
                          : "Não Conforme"}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Nenhuma inspeção registrada
                </p>
                <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Realizar primeira inspeção
                </button>
              </div>
            )}
          </motion.div>

          {/* Resumo por unidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Resumo por Unidades
              </h3>
              <Building className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {unidades
                .filter((u) => u.ativo)
                .slice(0, 5)
                .map((unidade) => {
                  const extintoresUnidade = extintores.filter(
                    (e) => e.unidadeId === unidade._id
                  );
                  const conformes = extintoresUnidade.filter(
                    (e) => e.status === "conforme"
                  ).length;
                  const total = extintoresUnidade.length;
                  const percentual =
                    total > 0 ? Math.round((conformes / total) * 100) : 0;

                  return (
                    <div
                      key={unidade._id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 truncate">
                          {unidade.nome}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {total} extintores
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Conformidade
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            percentual >= 80
                              ? "text-green-600"
                              : percentual >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {percentual}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            percentual >= 80
                              ? "bg-green-500"
                              : percentual >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
