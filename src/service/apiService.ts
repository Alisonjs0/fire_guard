import api from '../api/axios/axios'
import { User, Extinguisher, Alert, Inspection, Maintenance } from '../types/index'

// ===== USER SERVICE =====
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (userData: Omit<User, 'id'>) => api.post('/users', userData),
  update: (id: number, userData: Partial<User>) => api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`)
}

// ===== EXTINGUISHER SERVICE =====
export const extinguisherService = {
  getAll: () => api.get('/extinguisher'),
  getById: (id: number) => api.get(`/extinguisher/${id}`),
  create: (data: Omit<Extinguisher, 'id'>) => api.post('/extinguisher', data),
  update: (id: number, data: Partial<Extinguisher>) => api.put(`/extinguisher/${id}`, data),
  delete: (id: number) => api.delete(`/extinguisher/${id}`)
}

// ===== ALERT SERVICE =====
export const alertService = {
  getAll: () => api.get('/alert'),
  getById: (id: number) => api.get(`/alert/${id}`),
  create: (data: Omit<Alert, 'id'>) => api.post('/alert', data),
  update: (id: number, data: Partial<Alert>) => api.put(`/alert/${id}`, data),
  delete: (id: number) => api.delete(`/alert/${id}`)
}

// ===== INSPECTION SERVICE =====
export const inspectionService = {
  getAll: () => api.get('/inspection'),
  getById: (id: number) => api.get(`/inspection/${id}`),
  create: (data: Omit<Inspection, 'id'>) => api.post('/inspection', data),
  update: (id: number, data: Partial<Inspection>) => api.put(`/inspection/${id}`, data),
  delete: (id: number) => api.delete(`/inspection/${id}`)
}

// ===== MAINTENANCE SERVICE =====
export const maintenanceService = {
  getAll: () => api.get('/maintenance'),
  getById: (id: number) => api.get(`/maintenance/${id}`),
  create: (data: Omit<Maintenance, 'id'>) => api.post('/maintenance', data),
  update: (id: number, data: Partial<Maintenance>) => api.put(`/maintenance/${id}`, data),
  delete: (id: number) => api.delete(`/maintenance/${id}`)
}

// ===== SERVIÇO GENÉRICO =====
export const apiService = {
  // GET requests
  get: (endpoint: string) => api.get(endpoint),
  getById: (endpoint: string, id: number) => api.get(`${endpoint}/${id}`),
  
  // POST requests
  post: (endpoint: string, data: any) => api.post(endpoint, data),
  
  // PUT requests
  put: (endpoint: string, id: number, data: any) => api.put(`${endpoint}/${id}`, data),
  
  // DELETE requests
  delete: (endpoint: string, id: number) => api.delete(`${endpoint}/${id}`),
  
  // Batch operations
  deleteMultiple: async (endpoint: string, ids: number[]) => {
    const promises = ids.map(id => api.delete(`${endpoint}/${id}`))
    return Promise.all(promises)
  }
}

export default {
  users: userService,
  extinguishers: extinguisherService,
  alerts: alertService,
  inspections: inspectionService,
  maintenance: maintenanceService,
  generic: apiService
}