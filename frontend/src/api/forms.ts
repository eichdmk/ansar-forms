import { api } from './client'
import type { CreateFormDto, UpdateFormDto } from '../types'

export const formsAPI = {
  create: async (form: CreateFormDto) => {
    const { data } = await api.post('/forms', form)
    return data
  },
  getAll: async () => {
    const { data } = await api.get('/forms')
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/forms/${id}`)
    return data
  },
  update: async (id: string, form: UpdateFormDto) => {
    const { data } = await api.put(`/forms/${id}`, form)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/forms/${id}`)
    return data
  },
}
