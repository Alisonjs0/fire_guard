"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useCRUD } from "../../hooks/useCRUD";
import { Extintor, Unidade } from "../../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainHeader from "@/components/MainHeader";

const ExtintoresPage: React.FC = () => {
  // Utilitários para renderização dos cards
  const getStatusColor = (status: string) => {
    switch (status) {
      case "conforme":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case "nao_conforme":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      case "vencido":
        return "bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium";
      case "manutencao":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "conforme":
        return "Conforme";
      case "nao_conforme":
        return "Não Conforme";
      case "vencido":
        return "Vencido";
      case "manutencao":
        return "Em Manutenção";
      default:
        return status;
    }
  };

  const getUnidadeNome = (unidadeId: string) => {
    const unidade = unidades.find((u) => u._id === unidadeId);
    return unidade?.nome || "Unidade não encontrada";
  };

  const getTipoAgenteText = (tipo: string) => {
    switch (tipo) {
      case "po_abc":
        return "Pó ABC";
      case "co2":
        return "CO2";
      case "agua":
        return "Água";
      case "espuma":
        return "Espuma";
      case "po_quimico":
        return "Pó Químico";
      default:
        return tipo;
    }
  };
  const {
    data: extintores,
    loading,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useCRUD<Extintor>("extintores");
  const { data: unidades } = useCRUD<Unidade>("unidades");
  const [showForm, setShowForm] = useState(false);
  const [editingExtintor, setEditingExtintor] = useState<Extintor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");

  const filteredExtintores = extintores.filter((extintor) => {
    const matchesSearch =
      extintor.numeroIdentificacao
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      extintor.localizacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || extintor.status === statusFilter;
    const matchesTipo = !tipoFilter || extintor.tipoAgente === tipoFilter;
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const extintorData = {
      numeroIdentificacao: formData.get("numeroIdentificacao") as string,
      unidadeId: formData.get("unidadeId") as string,
      localizacao: formData.get("localizacao") as string,
      tipoAgente: formData.get("tipoAgente") as string,
      classeIncendio: formData.get("classeIncendio") as string,
      capacidade: formData.get("capacidade") as string,
      dataFabricacao: formData.get("dataFabricacao") as string,
      dataValidade: formData.get("dataValidade") as string,
      fabricante: formData.get("fabricante") as string,
      status: formData.get("status") as string,
      qrCode: formData.get("qrCode") as string,
      codigoBarras: formData.get("codigoBarras") as string,
      observacoes: formData.get("observacoes") as string,
      creator: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      //   if (editingExtintor) {
      //     await updateRecord(editingExtintor._id, { ...extintorData, updatedAt: new Date().toISOString() })
      //   } else {
      //     await createRecord(extintorData)
      //   }
      //   setShowForm(false)
      //   setEditingExtintor(null)
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleEdit = (extintor: Extintor) => {
    setEditingExtintor(extintor);
    setShowForm(true);
  };

  const handleDelete = async (extintor: Extintor) => {
    if (
      confirm(
        `Tem certeza que deseja excluir o extintor ${extintor.numeroIdentificacao}?`
      )
    ) {
      await deleteRecord(extintor._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header aprimorado */}
      <div className="max-w-7xl mx-auto">
        <MainHeader
          icon={<Shield className="w-8 h-8 text-red-600" />}
          textHeader="Extintores"
          subtitle="Cadastro e controle de equipamentos"
          showButton={true}
          buttonText="Novo Extintor"
          buttonIcon={<Plus className="w-5 h-5" />}
          onButtonClick={() => {
            setEditingExtintor(null);
            setShowForm(true);
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
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
                placeholder="Buscar por número ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os status</option>
              <option value="conforme">Conforme</option>
              <option value="nao_conforme">Não Conforme</option>
              <option value="vencido">Vencido</option>
              <option value="manutencao">Em Manutenção</option>
            </select>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os tipos</option>
              <option value="po_abc">Pó ABC</option>
              <option value="co2">CO2</option>
              <option value="agua">Água</option>
              <option value="espuma">Espuma</option>
              <option value="po_quimico">Pó Químico</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              <span className="font-medium">{filteredExtintores.length}</span>
              <span className="ml-1">extintor(es) encontrado(s)</span>
            </div>
          </div>
        </motion.div>

        {/* Lista de extintores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredExtintores.map((extintor, index) => (
            <motion.div
              key={extintor._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {extintor.numeroIdentificacao}
                    </h3>
                    <span className={getStatusColor(extintor.status)}>
                      {getStatusText(extintor.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(extintor)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(extintor)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{extintor.localizacao}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-medium">Unidade:</span>
                  <span>{getUnidadeNome(extintor.unidadeId)}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium">
                      {getTipoAgenteText(extintor.tipoAgente)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Classe:</span>
                    <p className="font-medium">{extintor.classeIncendio}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacidade:</span>
                    <p className="font-medium">{extintor.capacidade}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fabricante:</span>
                    <p className="font-medium">{extintor.fabricante}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Validade:{" "}
                      {format(new Date(extintor.dataValidade), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  {extintor.status === "vencido" && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Vencido</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredExtintores.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum extintor encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || tipoFilter
                ? "Tente ajustar os filtros de busca."
                : "Comece cadastrando seu primeiro extintor."}
            </p>
          </motion.div>
        )}

        {/* Modal de formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingExtintor ? "Editar Extintor" : "Novo Extintor"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ...form fields unchanged... */}
                  </div>
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingExtintor(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingExtintor ? "Atualizar" : "Criar"} Extintor
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

export default ExtintoresPage;
