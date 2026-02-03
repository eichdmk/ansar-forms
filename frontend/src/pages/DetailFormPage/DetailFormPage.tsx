import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { FormWithQuestions } from "../../types"
import type { AxiosError } from "axios"

export function DetailFormPage() {
    const { id } = useParams()

    const [form, setForm] = useState<FormWithQuestions | null>(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function loadFormAndQuestions() {
            if (!id) return
            try {
                const [formData, questions] = await Promise.all([
                    formsAPI.getById(id),
                    questionsApi.getByFormId(id),
                ])
                setForm({ ...formData, questions: questions ?? [] })
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    setMessage(err.response.data?.error ?? "Произошла ошибка")
                }
            }
        }

        loadFormAndQuestions()
    }, [id])


    return (
        <>
            <h1>{form?.title}</h1>
            {form?.description}
            {form?.questions.map(q=>{
                return <li key={q.id}>
                    <p>{q.label}</p>
                    <p>{q.options}</p>
                    <p>{q.required}</p>
                    <p>{q.type}</p>
                </li>
            })}

            <p>{message && <p>{message}</p> }</p>
        </>
    )
}