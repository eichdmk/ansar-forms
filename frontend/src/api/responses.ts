import { api } from './client'
import type { CreateResponseDto, ResponsesPageResult } from '../types'

export const responsesAPI = {
  getByFormId: async (
    formId: string,
    page: number = 1,
    limit: number = 1
  ): Promise<ResponsesPageResult> => {
    const { data } = await api.get(`/forms/${formId}/responses`, {
      params: { page, limit },
    })
    return data
  },
  submit: async (formId: string, dto: CreateResponseDto) => {
    const { data } = await api.post(`/forms/${formId}/responses`, dto)
    return data
  },
}
