import { api } from './client'


export const questionsApi = {
    getByFormId: async (formId: string) => {
        const { data } = await api.get(`/questions/${formId}`)
        return data
    },
    create: async (form_id: string) => {
        const { data } = await api.post(`/questions/${form_id}`)
        return data
    },
    update: async (id: string, form_id: string) => {
        const { data } = await api.put(`/questions/${form_id}/${id}`)
        return data
    },
    delete: async (id: string, form_id: string) => {
        const { data } = await api.delete(`/questions/${form_id}/${id}`)
        return data
    },
}