
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useCRUD<T extends { _id: string }>(entityName: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
    //   const response = await lumi.entities[entityName].list({
    //     sort: { createdAt: -1 }
    //   })
    //   setData(response.list || [])
    } catch (err: any) {
      const errorMessage = `Erro ao carregar ${entityName}: ${err.message || 'Erro desconhecido'}`
      setError(errorMessage)
      console.error(errorMessage, err)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [entityName])

  const createRecord = async (recordData: Omit<T, '_id'>) => {
    try {
      setLoading(true)
      
      // Processar dados do formulário para garantir tipos corretos
      const processedData = Object.entries(recordData).reduce((acc, [key, value]) => {
        // Converter strings numéricas para números
        if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value)) {
          acc[key] = parseFloat(value)
        }
        // Converter strings boolean
        else if (value === "true" || value === "false") {
          acc[key] = value === "true"
        }
        else {
          acc[key] = value
        }
        return acc
      }, {} as any)

    //   const newRecord = await lumi.entities[entityName].create(processedData)
    //   setData(prev => [newRecord, ...prev])
    //   toast.success(`${entityName} criado com sucesso!`)
    //   return newRecord
    } catch (err: any) {
      const errorMessage = `Erro ao criar ${entityName}: ${err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateRecord = async (id: string, updates: Partial<T>) => {
    if (typeof id !== 'string') {
      throw new Error('ID deve ser uma string')
    }

    try {
      setLoading(true)
    //   const updatedRecord = await lumi.entities[entityName].update(id, {
    //     ...updates,
    //     updatedAt: new Date().toISOString()
    //   })
    //   setData(prev => prev.map(item => item._id === id ? updatedRecord : item))
    //   toast.success(`${entityName} atualizado com sucesso!`)
    //   return updatedRecord
    } catch (err: any) {
      const errorMessage = `Erro ao atualizar ${entityName}: ${err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string) => {
    if (typeof id !== 'string' || id === '[object Object]') {
      throw new Error('ID inválido: deve ser uma string, não um objeto')
    }

    try {
      setLoading(true)
    //   await lumi.entities[entityName].delete(id)
      setData(prev => prev.filter(item => item._id !== id))
      toast.success(`${entityName} excluído com sucesso!`)
    } catch (err: any) {
      const errorMessage = `Erro ao excluir ${entityName}: ${err.message || 'Erro desconhecido'}`
      console.error(errorMessage, err)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMultipleRecords = async (ids: string[]) => {
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {
      throw new Error('Todos os IDs devem ser strings')
    }

    try {
      setLoading(true)
    //   await lumi.entities[entityName].deleteMany(ids)
      setData(prev => prev.filter(item => !ids.includes(item._id)))
      toast.success(`${ids.length} ${entityName}(s) excluído(s) com sucesso!`)
    } catch (err: any) {
      const errorMessage = `Erro ao excluir ${entityName}s: ${err.message || 'Erro desconhecido'}`
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
