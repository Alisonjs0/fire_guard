"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  User,
  Building,
  FileText,
} from "lucide-react";
import { useCRUD } from "../../hooks/useCRUD";
import { Manutencao, Extintor } from "../../types";
import MainHeader from "../../components/MainHeader"

const Manutencoes: React.FC = () => {
  const {
    data: manutencoes,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useCRUD<Manutencao>("manutencoes");
  const { data: extintores } = useCRUD<Extintor>("extintores");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingManutencao, setEditingManutencao] = useState<Manutencao | null>(
    null
  );
  const [formData, setFormData] = useState<{
    extintorId: string;
    tipo: "preventiva" | "corretiva" | "recarga" | "teste_hidrostatico";
    status: "agendada" | "em_andamento" | "concluida" | "cancelada";
    dataAgendada: string;
    dataRealizada?: string;
    tecnicoResponsavel: string;
    empresaManutencao: string;
    descricaoServico: string;
    custo?: string;
    observacoes?: string;
  }>({
    extintorId: "",
    tipo: "preventiva",
    status: "agendada",
    dataAgendada: "",
    dataRealizada: "",
    tecnicoResponsavel: "",
    empresaManutencao: "",
    descricaoServico: "",
    custo: "",
    observacoes: "",
  });

  const filteredManutencoes = useMemo(() => {
    return manutencoes.filter((manutencao) => {
      const matchesSearch =
        manutencao.tecnicoResponsavel
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        manutencao.empresaManutencao
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        manutencao.descricaoServico
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || manutencao.status === statusFilter;
      const matchesTipo =
        tipoFilter === "todos" || manutencao.tipo === tipoFilter;

      return matchesSearch && matchesStatus && matchesTipo;
    });
  }, [manutencoes, searchTerm, statusFilter, tipoFilter]);

  const stats = useMemo(() => {
    const total = manutencoes.length;
    const agendadas = manutencoes.filter((m) => m.status === "agendada").length;
    const concluidas = manutencoes.filter(
      (m) => m.status === "concluida"
    ).length;
    const atrasadas = manutencoes.filter(
      (m) =>
        m.status === "agendada" &&
        isBefore(parseISO(m.dataAgendada), new Date())
    ).length;
    const custoTotal = manutencoes
      .filter((m) => m.status === "concluida" && m.custo)
      .reduce((sum, m) => sum + (m.custo || 0), 0);

    return { total, agendadas, concluidas, atrasadas, custoTotal };
  }, [manutencoes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const manutencaoData = {
        ...formData,
        custo: formData.custo ? parseFloat(formData.custo) : undefined,
        dataRealizada: formData.dataRealizada || undefined,
      };

      //   if (editingManutencao) {
      //     await updateRecord(editingManutencao._id, manutencaoData)
      //   } else {
      //     await createRecord(manutencaoData)
      //   }

      setShowModal(false);
      setEditingManutencao(null);
      setFormData({
        extintorId: "",
        tipo: "preventiva",
        status: "agendada",
        dataAgendada: "",
        dataRealizada: "",
        tecnicoResponsavel: "",
        empresaManutencao: "",
        descricaoServico: "",
        custo: "",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao salvar manutenção:", error);
    }
  };

  const handleEdit = (manutencao: Manutencao) => {
    setEditingManutencao(manutencao);
    setFormData({
      extintorId: manutencao.extintorId,
      tipo: manutencao.tipo,
      status: manutencao.status,
      dataAgendada: manutencao.dataAgendada.split("T")[0],
      dataRealizada: manutencao.dataRealizada?.split("T")[0] || "",
      tecnicoResponsavel: manutencao.tecnicoResponsavel,
      empresaManutencao: manutencao.empresaManutencao,
      descricaoServico: manutencao.descricaoServico,
      custo: manutencao.custo?.toString() || "",
      observacoes: manutencao.observacoes || "",
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendada":
        return "bg-yellow-100 text-yellow-800";
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "concluida":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return "bg-blue-100 text-blue-800";
      case "corretiva":
        return "bg-orange-100 text-orange-800";
      case "recarga":
        return "bg-purple-100 text-purple-800";
      case "teste_hidrostatico":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MainHeader
          icon={<Wrench className="text-blue-600" />}
          textHeader="Manutenções"
          subtitle="Gerencie as manutenções dos extintores"
          showButton={true}
          buttonText="Nova Manutenção"
          buttonIcon={<Plus size={20} />}
          onButtonClick={() => setShowModal(true)}
        />
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.agendadas}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.concluidas}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.atrasadas}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {stats.custoTotal.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por técnico, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="agendada">Agendada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="recarga">Recarga</option>
              <option value="teste_hidrostatico">Teste Hidrostático</option>
            </select>

            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </motion.div>

        {/* Manutenções List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extintor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Agendada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredManutencoes.map((manutencao) => {
                  const extintor = extintores.find(
                    (e) => e._id === manutencao.extintorId
                  );
                  return (
                    <tr key={manutencao._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {extintor?.numeroIdentificacao || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {extintor?.localizacao}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(
                            manutencao.tipo
                          )}`}
                        >
                          {manutencao.tipo.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            manutencao.status
                          )}`}
                        >
                          {manutencao.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(
                          parseISO(manutencao.dataAgendada),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manutencao.tecnicoResponsavel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manutencao.empresaManutencao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {manutencao.custo
                          ? `R$ ${manutencao.custo.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(manutencao)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteRecord(manutencao._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingManutencao ? "Editar Manutenção" : "Nova Manutenção"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extintor
                      </label>
                      <select
                        value={formData.extintorId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            extintorId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
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
                        Tipo
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipo: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="preventiva">Preventiva</option>
                        <option value="corretiva">Corretiva</option>
                        <option value="recarga">Recarga</option>
                        <option value="teste_hidrostatico">
                          Teste Hidrostático
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="agendada">Agendada</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Agendada
                      </label>
                      <input
                        type="date"
                        value={formData.dataAgendada}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataAgendada: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Realizada
                      </label>
                      <input
                        type="date"
                        value={formData.dataRealizada}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataRealizada: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Técnico Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.tecnicoResponsavel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tecnicoResponsavel: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa de Manutenção
                      </label>
                      <input
                        type="text"
                        value={formData.empresaManutencao}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            empresaManutencao: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custo (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.custo}
                        onChange={(e) =>
                          setFormData({ ...formData, custo: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Serviço
                    </label>
                    <textarea
                      value={formData.descricaoServico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descricaoServico: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacoes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingManutencao(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {editingManutencao ? "Atualizar" : "Criar"} Manutenção
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manutencoes;
