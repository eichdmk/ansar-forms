import { api } from './client'
import type { LoginUserDto } from '../types'

export const authAPI = {
  login: async (user: LoginUserDto) => {
    const { data } = await api.post('/auth/login', user)
    return data
  },
  register: async (user: LoginUserDto) => {
    const { data } = await api.post('/auth/register', user)
    return data
  },
}
