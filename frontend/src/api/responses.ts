import { api } from './client'
import type { CreateResponseDto } from '../types'

export const responsesAPI = {
  submit: async (formId: string, dto: CreateResponseDto) => {
    const { data } = await api.post(`/forms/${formId}/responses`, dto)
    return data
  },
}
