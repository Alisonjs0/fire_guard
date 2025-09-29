
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios/axios'

// Mapeamento de nomes de entidades para endpoints da API
const ENTITY_ENDPOINTS: Record<string, string> = {
  'extinguisher': '/extinguisher',
  'extintor': '/extinguisher',
  'user': '/users',
  'usuario': '/users', 
  'alert': '/alert',
  'alerta': '/alert',
  'inspection': '/inspection',
  'inspecao': '/inspection',
  'maintenance': '/maintenance',
  'manutencao': '/maintenance',
  'equipment': '/equipment',
  'equipamento': '/equipment'
}

// Mapeamento de nomes de entidades para português nas mensagens
const ENTITY_NAMES_PT: Record<string, string> = {
  'extinguisher': 'extintor',
  'extintor': 'extintor',
  'user': 'usuário',
  'usuario': 'usuário', 
  'alert': 'alerta',
  'alerta': 'alerta',
  'inspection': 'inspeção',
  'inspecao': 'inspeção',
  'maintenance': 'manutenção',
  'manutencao': 'manutenção',
  'equipment': 'equipamento',
  'equipamento': 'equipamento'
}

export function useCRUD<T extends { id?: number | string; _id?: string }>(entityName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pega o endpoint correto baseado no nome da entidade
  const getEndpoint = () => ENTITY_ENDPOINTS[entityName.toLowerCase()] || `/${entityName}`
  
  // Pega o nome em português para as mensagens
  const getEntityNamePT = () => ENTITY_NAMES_PT[entityName.toLowerCase()] || entityName

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = getEndpoint()
      const response = await api.get(endpoint)
      
      // Spring Boot retorna os dados diretamente no response.data
      const responseData = Array.isArray(response.data) ? response.data : []
      setData(responseData)
    } catch (err: any) {
      const errorMessage = `Erro ao carregar ${getEntityNamePT()}: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`
      setError(errorMessage)
      console.error(errorMessage, err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [entityName])

  const createRecord = async (recordData: Omit<T, 'id' | '_id'>) => {
    try {
      setLoading(true)
      
      // Processa os dados para garantir tipos corretos
      const processedData = Object.entries(recordData).reduce((acc, [key, value]) => {
        if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
          acc[key] = parseFloat(value)
        }
        else if (value === "true" || value === "false") {
          acc[key] = value === "true"
        }
        else {
          acc[key] = value
        }
        return acc
      }, {} as any)

      const endpoint = getEndpoint()
      const response = await api.post(endpoint, processedData)
      
      // Adiciona o novo registro ao estado
      const newRecord = response.data
      setData(prev => [newRecord, ...prev])
      
      toast.success(`${getEntityNamePT()} criado com sucesso!`)
      return newRecord
    } catch (err: any) {
      const errorMessage = `Erro ao criar ${getEntityNamePT()}: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateRecord = async (id: string | number, updates: Partial<T>) => {
    if (!id && id !== 0) {
      throw new Error('ID é obrigatório')
    }

    try {
      setLoading(true)
      
      const endpoint = getEndpoint()
      const response = await api.put(`${endpoint}/${id}`, updates)
      
      const updatedRecord = response.data
      setData(prev => prev.map(item => {
        const itemId = item.id || item._id
        return itemId == id ? updatedRecord : item
      }))
      
      toast.success(`${getEntityNamePT()} atualizado com sucesso!`)
      return updatedRecord
    } catch (err: any) {
      const errorMessage = `Erro ao atualizar ${getEntityNamePT()}: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string | number) => {
    if (!id && id !== 0) {
      throw new Error('ID é obrigatório')
    }

    try {
      setLoading(true)
      
      const endpoint = getEndpoint()
      await api.delete(`${endpoint}/${id}`)
      
      setData(prev => prev.filter(item => {
        const itemId = item.id || item._id
        return itemId != id
      }))
      
      toast.success(`${getEntityNamePT()} excluído com sucesso!`)
    } catch (err: any) {
      const errorMessage = `Erro ao excluir ${getEntityNamePT()}: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMultipleRecords = async (ids: (string | number)[]) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Lista de IDs não pode estar vazia')
    }

    try {
      setLoading(true)
      
      // Como o Spring Boot não tem endpoint para deletar múltiplos,
      // fazemos uma requisição para cada ID
      const endpoint = getEndpoint()
      const deletePromises = ids.map(id => api.delete(`${endpoint}/${id}`))
      
      await Promise.all(deletePromises)
      
      setData(prev => prev.filter(item => {
        const itemId = item.id || item._id
        return !ids.includes(itemId!)
      }))
      
      toast.success(`${ids.length} ${getEntityNamePT()}(s) excluído(s) com sucesso!`)
    } catch (err: any) {
      const errorMessage = `Erro ao excluir ${getEntityNamePT()}s: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    fetchData,
    createRecord,
    updateRecord,
    deleteRecord,
    deleteMultipleRecords
  }
}
