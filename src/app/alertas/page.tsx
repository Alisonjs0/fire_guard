'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, isAfter, isBefore, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {AlertTriangle, Clock, CheckCircle, XCircle, Bell, Calendar, Filter, Search, Eye, EyeOff, Trash2, Settings, Download, RefreshCw, AlertCircle, Info, Zap} from 'lucide-react'
import { useCRUD } from '../../hooks/useCRUD'
import { Extintor, Inspecao, Manutencao } from '../../types'
import MainHeader from '@/components/MainHeader'

interface Alert {
  id: string
  type: 'vencimento' | 'inspecao' | 'manutencao' | 'sistema'
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  title: string
  message: string
  entityId?: string
  entityType?: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

const Alertas: React.FC = () => {
  const { data: extintores } = useCRUD<Extintor>('extintores')
  const { data: inspecoes } = useCRUD<Inspecao>('inspecoes')
  const { data: manutencoes } = useCRUD<Manutencao>('manutencoes')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('todos')
  const [priorityFilter, setPriorityFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [showSettings, setShowSettings] = useState(false)

  // Gerar alertas baseados nos dados
  const generatedAlerts = useMemo(() => {
    const alerts: Alert[] = []
    const today = new Date()

    // Alertas de vencimento de extintores
    extintores.forEach(extintor => {
      const dataValidade = parseISO(extintor.dataValidade)
      const diasParaVencimento = Math.ceil((dataValidade.getTime() - today.getTime()) / (1000 * 3600 * 24))
      
      if (diasParaVencimento <= 0) {
        alerts.push({
          id: `venc-${extintor._id}`,
          type: 'vencimento',
          priority: 'critica',
          title: 'Extintor Vencido',
          message: `Extintor ${extintor.numeroIdentificacao} venceu em ${format(dataValidade, 'dd/MM/yyyy')}`,
          entityId: extintor._id,
          entityType: 'extintor',
          createdAt: today.toISOString(),
          isRead: false,
          isResolved: false
        })
      } else if (diasParaVencimento <= 30) {
        alerts.push({
          id: `venc-30-${extintor._id}`,
          type: 'vencimento',
          priority: 'alta',
          title: 'Extintor Próximo ao Vencimento',
          message: `Extintor ${extintor.numeroIdentificacao} vence em ${diasParaVencimento} dias`,
          entityId: extintor._id,
          entityType: 'extintor',
          createdAt: today.toISOString(),
          isRead: false,
          isResolved: false
        })
      } else if (diasParaVencimento <= 90) {
        alerts.push({
          id: `venc-90-${extintor._id}`,
          type: 'vencimento',
          priority: 'media',
          title: 'Renovação Necessária',
          message: `Extintor ${extintor.numeroIdentificacao} vence em ${diasParaVencimento} dias`,
          entityId: extintor._id,
          entityType: 'extintor',
          createdAt: today.toISOString(),
          isRead: false,
          isResolved: false
        })
      }
    })

    // Alertas de inspeções pendentes
    extintores.forEach(extintor => {
      const inspecoesExtintor = inspecoes.filter(i => i.extintorId === extintor._id)
      const ultimaInspecao = inspecoesExtintor
        .sort((a, b) => new Date(b.dataInspecao).getTime() - new Date(a.dataInspecao).getTime())[0]
      
      if (!ultimaInspecao) {
        alerts.push({
          id: `insp-never-${extintor._id}`,
          type: 'inspecao',
          priority: 'alta',
          title: 'Inspeção Nunca Realizada',
          message: `Extintor ${extintor.numeroIdentificacao} nunca foi inspecionado`,
          entityId: extintor._id,
          entityType: 'extintor',
          createdAt: today.toISOString(),
          isRead: false,
          isResolved: false
        })
      } else {
        const diasUltimaInspecao = Math.ceil((today.getTime() - parseISO(ultimaInspecao.dataInspecao).getTime()) / (1000 * 3600 * 24))
        
        if (diasUltimaInspecao > 365) {
          alerts.push({
            id: `insp-overdue-${extintor._id}`,
            type: 'inspecao',
            priority: 'critica',
            title: 'Inspeção Atrasada',
            message: `Extintor ${extintor.numeroIdentificacao} não é inspecionado há ${diasUltimaInspecao} dias`,
            entityId: extintor._id,
            entityType: 'extintor',
            createdAt: today.toISOString(),
            isRead: false,
            isResolved: false
          })
        } else if (diasUltimaInspecao > 300) {
          alerts.push({
            id: `insp-due-${extintor._id}`,
            type: 'inspecao',
            priority: 'alta',
            title: 'Inspeção Necessária',
            message: `Extintor ${extintor.numeroIdentificacao} precisa de inspeção`,
            entityId: extintor._id,
            entityType: 'extintor',
            createdAt: today.toISOString(),
            isRead: false,
            isResolved: false
          })
        }
      }
    })

    // Alertas de manutenções atrasadas
    manutencoes.forEach(manutencao => {
      if (manutencao.status === 'agendada') {
        const dataAgendada = parseISO(manutencao.dataAgendada)
        const diasAtraso = Math.ceil((today.getTime() - dataAgendada.getTime()) / (1000 * 3600 * 24))
        
        if (diasAtraso > 0) {
          const extintor = extintores.find(e => e._id === manutencao.extintorId)
          alerts.push({
            id: `manut-${manutencao._id}`,
            type: 'manutencao',
            priority: diasAtraso > 7 ? 'critica' : 'alta',
            title: 'Manutenção Atrasada',
            message: `Manutenção do extintor ${extintor?.numeroIdentificacao} está ${diasAtraso} dias atrasada`,
            entityId: manutencao._id,
            entityType: 'manutencao',
            createdAt: today.toISOString(),
            isRead: false,
            isResolved: false
          })
        }
      }
    })

    // Alertas de sistema
    const extintoresNaoConformes = extintores.filter(e => e.status === 'nao_conforme').length
    if (extintoresNaoConformes > 0) {
      alerts.push({
        id: 'sistema-nao-conformes',
        type: 'sistema',
        priority: 'media',
        title: 'Extintores Não Conformes',
        message: `${extintoresNaoConformes} extintor(es) não conforme(s) detectado(s)`,
        createdAt: today.toISOString(),
        isRead: false,
        isResolved: false
      })
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critica: 4, alta: 3, media: 2, baixa: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [extintores, inspecoes, manutencoes])

  const filteredAlerts = useMemo(() => {
    return generatedAlerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'todos' || alert.type === typeFilter
      const matchesPriority = priorityFilter === 'todos' || alert.priority === priorityFilter
      
      let matchesStatus = true
      if (statusFilter === 'nao_lidos') matchesStatus = !alert.isRead
      else if (statusFilter === 'lidos') matchesStatus = alert.isRead
      else if (statusFilter === 'resolvidos') matchesStatus = alert.isResolved
      else if (statusFilter === 'pendentes') matchesStatus = !alert.isResolved
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus
    })
  }, [generatedAlerts, searchTerm, typeFilter, priorityFilter, statusFilter])

  const stats = useMemo(() => {
    const total = generatedAlerts.length
    const criticos = generatedAlerts.filter(a => a.priority === 'critica').length
    const altos = generatedAlerts.filter(a => a.priority === 'alta').length
    const naoLidos = generatedAlerts.filter(a => !a.isRead).length
    const resolvidos = generatedAlerts.filter(a => a.isResolved).length

    return { total, criticos, altos, naoLidos, resolvidos }
  }, [generatedAlerts])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critica': return <AlertTriangle className="h-4 w-4" />
      case 'alta': return <AlertCircle className="h-4 w-4" />
      case 'media': return <Clock className="h-4 w-4" />
      case 'baixa': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vencimento': return <Calendar className="h-5 w-5" />
      case 'inspecao': return <Eye className="h-5 w-5" />
      case 'manutencao': return <Settings className="h-5 w-5" />
      case 'sistema': return <Zap className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <MainHeader
          icon={<Bell className="w-8 h-8 text-red-600" />}
          textHeader="Alertas"
          badgeValue={stats.naoLidos}
          subtitle="Monitore alertas e notificações do sistema"
          buttonIcon={<Settings size={20} />}
          buttonText='Configurar'
          showButton={true}
          onButtonClick={() => setShowSettings(true)}
          secondButtonIcon={<RefreshCw size={20} />}
          secondButtonText='Atualizar'
          showSecondButton={true}
          onSecondButtonClick={() => {/* Lógica para atualizar */}}
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
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridade</p>
                <p className="text-2xl font-bold text-orange-600">{stats.altos}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Não Lidos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.naoLidos}</p>
              </div>
              <EyeOff className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvidos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="vencimento">Vencimento</option>
              <option value="inspecao">Inspeção</option>
              <option value="manutencao">Manutenção</option>
              <option value="sistema">Sistema</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="nao_lidos">Não Lidos</option>
              <option value="lidos">Lidos</option>
              <option value="pendentes">Pendentes</option>
              <option value="resolvidos">Resolvidos</option>
            </select>
            
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </motion.div>

        {/* Alerts List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum alerta encontrado</h3>
              <p className="text-gray-600">Todos os alertas foram resolvidos ou não há alertas para os filtros selecionados.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  alert.priority === 'critica' ? 'border-red-500' :
                  alert.priority === 'alta' ? 'border-orange-500' :
                  alert.priority === 'media' ? 'border-yellow-500' :
                  'border-green-500'
                } p-6 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(alert.priority)}`}>
                          {getPriorityIcon(alert.priority)}
                          {alert.priority}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(parseISO(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors">
                      <CheckCircle size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Alertas
