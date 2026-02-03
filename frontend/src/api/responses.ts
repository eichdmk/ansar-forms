import { api } from './client'
import type { CreateResponseDto, ResponseWithAnswers } from '../types'

export const responsesAPI = {
  getByFormId: async (formId: string): Promise<ResponseWithAnswers[]> => {
    const { data } = await api.get(`/forms/${formId}/responses`)
    return data
  },
  submit: async (formId: string, dto: CreateResponseDto) => {
    const { data } = await api.post(`/forms/${formId}/responses`, dto)
    return data
  },
}
