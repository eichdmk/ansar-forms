import { api } from './client'
import type {
  FormAccessWithUser,
  CreateInviteDto,
  CreateInviteResult,
  AcceptInviteResult,
} from '../types/formAccess'

export const formAccessAPI = {
  getAccessList: async (formId: string): Promise<FormAccessWithUser[]> => {
    const { data } = await api.get(`/forms/${formId}/access`)
    return data
  },

  addAccess: async (formId: string, userId: string, role: 'editor' | 'viewer') => {
    await api.post(`/forms/${formId}/access`, { userId, role })
  },

  removeAccess: async (formId: string, userId: string) => {
    await api.delete(`/forms/${formId}/access/${userId}`)
  },

  createInvite: async (
    formId: string,
    dto: CreateInviteDto
  ): Promise<CreateInviteResult> => {
    const { data } = await api.post(`/forms/${formId}/invites`, dto)
    return data
  },

  acceptInvite: async (token: string): Promise<AcceptInviteResult> => {
    const { data } = await api.post('/forms/join', { token })
    return data
  },
}
