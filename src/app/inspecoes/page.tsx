"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Camera,
  FileText,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  Upload,
  Check,
  X,
  Save,
  Shield,
  Activity,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { useCRUD } from "../../hooks/useCRUD";
import { Extintor, Inspecao, Unidade, Checklist } from "../../types";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainHeader from "../../components/MainHeader";

const InspecoesPage: React.FC = () => {
  const {
    data: inspecoes,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useCRUD<Inspecao>("inspecoes");
  const { data: extintores } = useCRUD<Extintor>("extintores");
  const { data: unidades } = useCRUD<Unidade>("unidades");

  const [showForm, setShowForm] = useState(false);
  const [editingInspecao, setEditingInspecao] = useState<Inspecao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroResultado, setFiltroResultado] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [selectedExtintor, setSelectedExtintor] = useState("");
  const [activeTab, setActiveTab] = useState("lista");

  // Estado do formulário
  const [formData, setFormData] = useState({
    extintorId: "",
    inspetorId: "admin",
    dataInspecao: new Date().toISOString().slice(0, 16),
    resultado: "conforme" as "conforme" | "nao_conforme",
    checklist: {
      manometro: true,
      rotulo: true,
      lacre: true,
      sinalizacao: true,
      danos: true,
      obstrucoes: true,
      fixacao: true,
      validade: true,
    } as Checklist,
    observacoes: "",
    fotos: [] as string[],
    proximaInspecao: "",
  });

  const inspecoesFiltradas = inspecoes.filter((inspecao) => {
    const extintor = extintores.find((e) => e._id === inspecao.extintorId);
    const matchesSearch =
      extintor?.numeroIdentificacao
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspecao.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResultado =
      !filtroResultado || inspecao.resultado === filtroResultado;

    let matchesPeriodo = true;
    if (filtroPeriodo) {
      const dataInspecao = new Date(inspecao.dataInspecao);
      switch (filtroPeriodo) {
        case "hoje":
          matchesPeriodo = isToday(dataInspecao);
          break;
        case "semana":
          matchesPeriodo = isThisWeek(dataInspecao);
          break;
        case "mes":
          matchesPeriodo = isThisMonth(dataInspecao);
          break;
      }
    }

    return matchesSearch && matchesResultado && matchesPeriodo;
  });

  const estatisticas = {
    total: inspecoes.length,
    conformes: inspecoes.filter((i) => i.resultado === "conforme").length,
    naoConformes: inspecoes.filter((i) => i.resultado === "nao_conforme")
      .length,
    hoje: inspecoes.filter((i) => isToday(new Date(i.dataInspecao))).length,
    semana: inspecoes.filter((i) => isThisWeek(new Date(i.dataInspecao)))
      .length,
    mes: inspecoes.filter((i) => isThisMonth(new Date(i.dataInspecao))).length,
  };

  const getExtintorInfo = (extintorId: string) => {
    const extintor = extintores.find((e) => e._id === extintorId);
    if (!extintor) return { numero: "N/A", localizacao: "N/A", unidade: "N/A" };

    const unidade = unidades.find((u) => u._id === extintor.unidadeId);
    return {
      numero: extintor.numeroIdentificacao,
      localizacao: extintor.localizacao,
      unidade: unidade?.nome || "N/A",
    };
  };

  const handleChecklistChange = (item: keyof Checklist, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [item]: value,
      },
    }));
  };

  const calcularResultado = () => {
    const itensChecklist = Object.values(formData.checklist);
    const todosConformes = itensChecklist.every((item) => item === true);
    return todosConformes ? "conforme" : "nao_conforme";
  };

  useEffect(() => {
    const resultado = calcularResultado();
    if (resultado !== formData.resultado) {
      setFormData((prev) => ({ ...prev, resultado }));
    }
  }, [formData.checklist]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const inspecaoData = {
        ...formData,
        resultado: calcularResultado(),
        creator: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      //   if (editingInspecao) {
      //     await updateRecord(editingInspecao._id, { ...inspecaoData, updatedAt: new Date().toISOString() })
      //   } else {
      //     await createRecord(inspecaoData)
      //   }

      setShowForm(false);
      setEditingInspecao(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar inspeção:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      extintorId: "",
      inspetorId: "admin",
      dataInspecao: new Date().toISOString().slice(0, 16),
      resultado: "conforme",
      checklist: {
        manometro: true,
        rotulo: true,
        lacre: true,
        sinalizacao: true,
        danos: true,
        obstrucoes: true,
        fixacao: true,
        validade: true,
      },
      observacoes: "",
      fotos: [],
      proximaInspecao: "",
    });
  };

  const handleEdit = (inspecao: Inspecao) => {
    setEditingInspecao(inspecao);
    setFormData({
      extintorId: inspecao.extintorId,
      inspetorId: inspecao.inspetorId,
      dataInspecao: new Date(inspecao.dataInspecao).toISOString().slice(0, 16),
      resultado: inspecao.resultado,
      checklist: inspecao.checklist,
      observacoes: inspecao.observacoes || "",
      fotos: inspecao.fotos || [],
      proximaInspecao: inspecao.proximaInspecao
        ? new Date(inspecao.proximaInspecao).toISOString().slice(0, 16)
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (inspecao: Inspecao) => {
    const extintorInfo = getExtintorInfo(inspecao.extintorId);
    if (
      confirm(
        `Tem certeza que deseja excluir a inspeção do extintor ${extintorInfo.numero}?`
      )
    ) {
      await deleteRecord(inspecao._id);
    }
  };

  const itensChecklist = [
    { key: "manometro", label: "Manômetro na faixa verde", icon: BarChart3 },
    { key: "rotulo", label: "Rótulo legível", icon: FileText },
    { key: "lacre", label: "Lacre intacto", icon: Shield },
    { key: "sinalizacao", label: "Sinalização adequada", icon: MapPin },
    { key: "danos", label: "Ausência de danos físicos", icon: AlertTriangle },
    { key: "obstrucoes", label: "Ausência de obstruções", icon: Eye },
    { key: "fixacao", label: "Fixação adequada", icon: Check },
    { key: "validade", label: "Dentro da validade", icon: Calendar },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <MainHeader
          icon={<Eye className="w-8 h-8 text-red-600" />}
          textHeader="Inspeções"
          subtitle="Controle e registro de inspeções"
          showButton={true}
          buttonText="Nova Inspeção"
          buttonIcon={<Plus className="w-4 h-4" />}
          onButtonClick={() => setShowForm(true)}
          showSecondButton={true}
          secondButtonText="Exportar"
          secondButtonIcon={<Download className="w-4 h-4" />}
          onSecondButtonClick={() => {resetForm(); setEditingInspecao(null); setShowForm(true)}}
          
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            {
              label: "Total",
              valor: estatisticas.total,
              cor: "blue",
              icon: Activity,
            },
            {
              label: "Conformes",
              valor: estatisticas.conformes,
              cor: "green",
              icon: CheckCircle,
            },
            {
              label: "Não Conformes",
              valor: estatisticas.naoConformes,
              cor: "red",
              icon: XCircle,
            },
            {
              label: "Hoje",
              valor: estatisticas.hoje,
              cor: "purple",
              icon: Clock,
            },
            {
              label: "Esta Semana",
              valor: estatisticas.semana,
              cor: "indigo",
              icon: Calendar,
            },
            {
              label: "Este Mês",
              valor: estatisticas.mes,
              cor: "orange",
              icon: TrendingUp,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.valor}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-${stat.cor}-100 flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 text-${stat.cor}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: "lista", label: "Lista de Inspeções", icon: Eye },
            { id: "calendario", label: "Calendário", icon: Calendar },
            { id: "relatorios", label: "Relatórios", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por extintor ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filtroResultado}
              onChange={(e) => setFiltroResultado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os resultados</option>
              <option value="conforme">Conforme</option>
              <option value="nao_conforme">Não Conforme</option>
            </select>

            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os períodos</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mês</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              <span className="font-medium">{inspecoesFiltradas.length}</span>
              <span className="ml-1">inspeção(ões) encontrada(s)</span>
            </div>
          </div>
        </motion.div>

        {/* Lista de inspeções */}
        <AnimatePresence>
          {activeTab === "lista" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {inspecoesFiltradas.map((inspecao, index) => {
                const extintorInfo = getExtintorInfo(inspecao.extintorId);
                const itensConformes = Object.values(inspecao.checklist).filter(
                  Boolean
                ).length;
                const totalItens = Object.keys(inspecao.checklist).length;
                const percentualConformidade = Math.round(
                  (itensConformes / totalItens) * 100
                );

                return (
                  <motion.div
                    key={inspecao._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            inspecao.resultado === "conforme"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {inspecao.resultado === "conforme" ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {extintorInfo.numero}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(inspecao)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inspecao)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{extintorInfo.localizacao}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{extintorInfo.unidade}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(
                            new Date(inspecao.dataInspecao),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>

                      {/* Barra de conformidade */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Conformidade do Checklist</span>
                          <span>{percentualConformidade}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              percentualConformidade >= 80
                                ? "bg-green-500"
                                : percentualConformidade >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${percentualConformidade}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {itensConformes} de {totalItens} itens conformes
                        </div>
                      </div>

                      {inspecao.observacoes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {inspecao.observacoes}
                          </p>
                        </div>
                      )}

                      {inspecao.fotos && inspecao.fotos.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Camera className="w-4 h-4" />
                          <span>
                            {inspecao.fotos.length} foto(s) anexada(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {inspecoesFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Eye className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma inspeção encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filtroResultado || filtroPeriodo
                ? "Tente ajustar os filtros de busca."
                : "Comece realizando sua primeira inspeção."}
            </p>
          </motion.div>
        )}

        {/* Modal de formulário */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingInspecao ? "Editar Inspeção" : "Nova Inspeção"}
                    </h3>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Extintor *
                        </label>
                        <select
                          value={formData.extintorId}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              extintorId: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione um extintor</option>
                          {extintores.map((extintor) => (
                            <option key={extintor._id} value={extintor._id}>
                              {extintor.numeroIdentificacao} -{" "}
                              {extintor.localizacao}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data e Hora da Inspeção *
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.dataInspecao}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dataInspecao: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Checklist */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Checklist de Inspeção
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itensChecklist.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              <item.icon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700">
                                {item.label}
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleChecklistChange(item.key, true)
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  formData.checklist[item.key]
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-200 text-gray-400 hover:bg-green-100 hover:text-green-600"
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleChecklistChange(item.key, false)
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  !formData.checklist[item.key]
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-200 text-gray-400 hover:bg-red-100 hover:text-red-600"
                                }`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resultado automático */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            formData.resultado === "conforme"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {formData.resultado === "conforme" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Resultado:{" "}
                            {formData.resultado === "conforme"
                              ? "Conforme"
                              : "Não Conforme"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Calculado automaticamente baseado no checklist
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Observações e próxima inspeção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observações
                        </label>
                        <textarea
                          rows={4}
                          value={formData.observacoes}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              observacoes: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Observações adicionais sobre a inspeção..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Próxima Inspeção
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.proximaInspecao}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              proximaInspecao: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {/* Upload de fotos */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fotos da Inspeção
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Clique para adicionar fotos ou arraste arquivos
                              aqui
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {editingInspecao ? "Atualizar" : "Salvar"} Inspeção
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InspecoesPage;
