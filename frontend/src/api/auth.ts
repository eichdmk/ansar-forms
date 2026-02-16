import { api } from './client'
import type { LoginUserDto } from '../types'

export type MeResponse = { id: string; email: string; terms_text: string }

export const authAPI = {
  login: async (user: LoginUserDto) => {
    const { data } = await api.post('/auth/login', user)
    return data
  },
  register: async (user: LoginUserDto) => {
    const { data } = await api.post('/auth/register', user)
    return data
  },
  getMe: async (): Promise<MeResponse> => {
    const { data } = await api.get('/auth/me')
    return data
  },
  updateTerms: async (terms_text: string): Promise<MeResponse> => {
    const { data } = await api.patch('/auth/me', { terms_text })
    return data
  },
}
