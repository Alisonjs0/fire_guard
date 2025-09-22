'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {FileText, Download, Filter, Calendar, BarChart3, PieChart, TrendingUp, TrendingDown, Users, MapPin, Wrench, Eye, AlertTriangle, CheckCircle, XCircle, Clock, DollarSign} from 'lucide-react'
import { useCRUD } from '../../hooks/useCRUD'
import { Extintor, Inspecao, Manutencao, Unidade } from '../../types'
import MainHeader from '@/components/MainHeader'

const Relatorios: React.FC = () => {
  const { data: extintores } = useCRUD<Extintor>('extintores')
  const { data: inspecoes } = useCRUD<Inspecao>('inspecoes')
  const { data: manutencoes } = useCRUD<Manutencao>('manutencoes')
  const { data: unidades } = useCRUD<Unidade>('unidades')
  
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [selectedUnidade, setSelectedUnidade] = useState<string>('todas')
  const [reportType, setReportType] = useState<string>('geral')

  // Dados filtrados por período e unidade
  const filteredData = useMemo(() => {
    const startDate = parseISO(dateRange.start)
    const endDate = parseISO(dateRange.end)
    
    const filteredExtintores = selectedUnidade === 'todas' 
      ? extintores 
      : extintores.filter(e => e.unidadeId === selectedUnidade)
    
    const filteredInspecoes = inspecoes.filter(i => {
      const inspecaoDate = parseISO(i.dataInspecao)
      const matchesDate = isWithinInterval(inspecaoDate, { start: startDate, end: endDate })
      const matchesUnidade = selectedUnidade === 'todas' || 
        filteredExtintores.some(e => e._id === i.extintorId)
      return matchesDate && matchesUnidade
    })
    
    const filteredManutencoes = manutencoes.filter(m => {
      const manutencaoDate = parseISO(m.dataAgendada)
      const matchesDate = isWithinInterval(manutencaoDate, { start: startDate, end: endDate })
      const matchesUnidade = selectedUnidade === 'todas' || 
        filteredExtintores.some(e => e._id === m.extintorId)
      return matchesDate && matchesUnidade
    })
    
    return { extintores: filteredExtintores, inspecoes: filteredInspecoes, manutencoes: filteredManutencoes }
  }, [extintores, inspecoes, manutencoes, dateRange, selectedUnidade])

  // Estatísticas gerais
  const stats = useMemo(() => {
    const { extintores: fExtintores, inspecoes: fInspecoes, manutencoes: fManutencoes } = filteredData
    
    const totalExtintores = fExtintores.length
    const extintoresConformes = fExtintores.filter(e => e.status === 'conforme').length
    const extintoresNaoConformes = fExtintores.filter(e => e.status === 'nao_conforme').length
    const extintoresVencidos = fExtintores.filter(e => e.status === 'vencido').length
    
    const totalInspecoes = fInspecoes.length
    const inspecoesConformes = fInspecoes.filter(i => i.resultado === 'conforme').length
    const inspecoesNaoConformes = fInspecoes.filter(i => i.resultado === 'nao_conforme').length
    
    const totalManutencoes = fManutencoes.length
    const manutencoesAgendadas = fManutencoes.filter(m => m.status === 'agendada').length
    const manutencoesConcluidas = fManutencoes.filter(m => m.status === 'concluida').length
    const custoTotalManutencoes = fManutencoes
      .filter(m => m.status === 'concluida' && m.custo)
      .reduce((sum, m) => sum + (m.custo || 0), 0)
    
    return {
      extintores: {
        total: totalExtintores,
        conformes: extintoresConformes,
        naoConformes: extintoresNaoConformes,
        vencidos: extintoresVencidos,
        percentualConforme: totalExtintores > 0 ? (extintoresConformes / totalExtintores) * 100 : 0
      },
      inspecoes: {
        total: totalInspecoes,
        conformes: inspecoesConformes,
        naoConformes: inspecoesNaoConformes,
        percentualConforme: totalInspecoes > 0 ? (inspecoesConformes / totalInspecoes) * 100 : 0
      },
      manutencoes: {
        total: totalManutencoes,
        agendadas: manutencoesAgendadas,
        concluidas: manutencoesConcluidas,
        custoTotal: custoTotalManutencoes
      }
    }
  }, [filteredData])

  // Dados por unidade
  const dadosPorUnidade = useMemo(() => {
    return unidades.map(unidade => {
      const extintoresUnidade = extintores.filter(e => e.unidadeId === unidade._id)
      const inspecoesUnidade = inspecoes.filter(i => 
        extintoresUnidade.some(e => e._id === i.extintorId)
      )
      const manutencoesUnidade = manutencoes.filter(m => 
        extintoresUnidade.some(e => e._id === m.extintorId)
      )
      
      return {
        unidade: unidade.nome,
        extintores: extintoresUnidade.length,
        conformes: extintoresUnidade.filter(e => e.status === 'conforme').length,
        inspecoes: inspecoesUnidade.length,
        manutencoes: manutencoesUnidade.length
      }
    })
  }, [unidades, extintores, inspecoes, manutencoes])

  // Dados por tipo de extintor
  const dadosPorTipo = useMemo(() => {
    const tipos = ['po_abc', 'co2', 'agua', 'espuma', 'po_quimico']
    return tipos.map(tipo => {
      const extintoresTipo = filteredData.extintores.filter(e => e.tipoAgente === tipo)
      return {
        tipo: tipo.replace('_', ' ').toUpperCase(),
        quantidade: extintoresTipo.length,
        conformes: extintoresTipo.filter(e => e.status === 'conforme').length
      }
    }).filter(item => item.quantidade > 0)
  }, [filteredData.extintores])

  // Evolução mensal
  const evolucaoMensal = useMemo(() => {
    const meses = []
    const hoje = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const mes = subMonths(hoje, i)
      const inicioMes = startOfMonth(mes)
      const fimMes = endOfMonth(mes)
      
      const inspecoesMes = inspecoes.filter(i => {
        const dataInspecao = parseISO(i.dataInspecao)
        return isWithinInterval(dataInspecao, { start: inicioMes, end: fimMes })
      })
      
      const manutencoesMes = manutencoes.filter(m => {
        const dataManutencao = parseISO(m.dataAgendada)
        return isWithinInterval(dataManutencao, { start: inicioMes, end: fimMes })
      })
      
      meses.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        inspecoes: inspecoesMes.length,
        manutencoes: manutencoesMes.length
      })
    }
    
    return meses
  }, [inspecoes, manutencoes])

  const exportarRelatorio = () => {
    // Implementar exportação para PDF/Excel
    console.log('Exportando relatório...')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MainHeader
          icon={<FileText className="text-blue-600" />}
          textHeader="Relatórios"
          subtitle="Análises e estatísticas do sistema"
          showButton={true}
          buttonText="Exportar Relatório"
          buttonIcon={<Download size={20} />}
          
        />


        {/* Filtros */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                value={selectedUnidade}
                onChange={(e) => setSelectedUnidade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todas as Unidades</option>
                {unidades.map(unidade => (
                  <option key={unidade._id} value={unidade._id}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="geral">Relatório Geral</option>
                <option value="extintores">Extintores</option>
                <option value="inspecoes">Inspeções</option>
                <option value="manutencoes">Manutenções</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Cards de Estatísticas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.extintores.total}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total de Extintores</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.extintores.percentualConforme}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{stats.extintores.percentualConforme.toFixed(1)}% conformes</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.extintores.conformes}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Extintores Conformes</h3>
            <p className="text-sm text-gray-600">
              {stats.extintores.naoConformes} não conformes, {stats.extintores.vencidos} vencidos
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.inspecoes.total}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspeções Realizadas</h3>
            <p className="text-sm text-gray-600">
              {stats.inspecoes.percentualConforme.toFixed(1)}% conformes
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                R$ {stats.manutencoes.custoTotal.toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custo de Manutenções</h3>
            <p className="text-sm text-gray-600">
              {stats.manutencoes.concluidas} concluídas
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Evolução Mensal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Evolução Mensal
            </h3>
            <div className="space-y-4">
              {evolucaoMensal.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 w-16">{item.mes}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Inspeções</span>
                          <span className="text-xs font-medium text-blue-600">{item.inspecoes}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(item.inspecoes / Math.max(...evolucaoMensal.map(e => e.inspecoes))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Manutenções</span>
                          <span className="text-xs font-medium text-green-600">{item.manutencoes}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(item.manutencoes / Math.max(...evolucaoMensal.map(e => e.manutencoes))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Distribuição por Tipo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Distribuição por Tipo
            </h3>
            <div className="space-y-3">
              {dadosPorTipo.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.tipo}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{item.quantidade}</div>
                    <div className="text-xs text-gray-500">{item.conformes} conformes</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabela por Unidade */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Dados por Unidade
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Extintores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conformes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspeções
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manutenções
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Conformidade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dadosPorUnidade.map((item, index) => {
                  const percentualConformidade = item.extintores > 0 ? (item.conformes / item.extintores) * 100 : 0
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.unidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.extintores}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.conformes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.inspecoes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.manutencoes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                percentualConformidade >= 80 ? 'bg-green-600' :
                                percentualConformidade >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${percentualConformidade}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {percentualConformidade.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Relatorios
