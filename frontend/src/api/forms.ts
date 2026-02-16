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
  getFormTerms: async (id: string): Promise<{ form_title: string; terms_text: string }> => {
    const { data } = await api.get(`/forms/${id}/terms`)
    return data
  },
  getByIdWithRole: async (id: string) => {
    const { data } = await api.get(`/forms/${id}/me`)
    return data
  },
  update: async (id: string, form: UpdateFormDto) => {
    const { data } = await api.put(`/forms/${id}`, form)
    return data
  },
  updateStatus: async (id: string, is_published: boolean) => {
    const { data } = await api.patch(`/forms/${id}/status`, { is_published })
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/forms/${id}`)
    return data
  },
}
