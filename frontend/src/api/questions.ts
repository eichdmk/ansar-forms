import { api } from './client'
import type { CreateQuestionDto, UpdateQuestionDto } from '../types/questions'

export const questionsApi = {
    getByFormId: async (formId: string) => {
        const { data } = await api.get(`/questions/${formId}`)
        return data
    },
    create: async (formId: string, dto: CreateQuestionDto) => {
        const { data } = await api.post(`/questions/${formId}`, dto)
        return data
    },
    update: async (questionId: string, formId: string, dto: UpdateQuestionDto) => {
        const { data } = await api.put(`/questions/${formId}/${questionId}`, dto)
        return data
    },
    delete: async (id: string, form_id: string) => {
        const { data } = await api.delete(`/questions/${form_id}/${id}`)
        return data
    },
}