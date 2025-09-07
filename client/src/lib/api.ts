import axios from 'axios'
import { useAuth } from '../store/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const { token } = useAuth.getState()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

export type Customer = { _id: string; name: string; email: string; phone?: string; company?: string }
export type Lead = { _id: string; customerId: string; title: string; description?: string; status: 'New'|'Contacted'|'Converted'|'Lost'; value: number; createdAt: string }

export const AuthAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/me'),
}

export const CustomersAPI = {
  list: (params: { search?: string; page?: number; limit?: number }) => api.get('/customers', { params }),
  create: (payload: { name: string; email: string; phone?: string; company?: string }) => api.post('/customers', payload),
  get: (id: string) => api.get(`/customers/${id}`),
  update: (id: string, payload: Partial<{ name: string; email: string; phone?: string; company?: string }>) => api.put(`/customers/${id}`, payload),
  remove: (id: string) => api.delete(`/customers/${id}`),
}

export const LeadsAPI = {
  list: (customerId: string, status?: string) => api.get(`/customers/${customerId}/leads`, { params: { status } }),
  create: (customerId: string, payload: { title: string; description?: string; status?: string; value?: number }) => api.post(`/customers/${customerId}/leads`, payload),
  update: (customerId: string, leadId: string, payload: Partial<{ title: string; description?: string; status?: string; value?: number }>) => api.put(`/customers/${customerId}/leads/${leadId}`, payload),
  remove: (customerId: string, leadId: string) => api.delete(`/customers/${customerId}/leads/${leadId}`),
}

export const ReportsAPI = {
  leadStatus: () => api.get('/reports/lead-status'),
}
