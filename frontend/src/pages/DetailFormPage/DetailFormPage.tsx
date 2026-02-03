import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formsAPI } from "../../api"
import type { FormWithQuestions } from "../../types"
import type { AxiosError } from "axios"

export function DetailFormPage() {
    const { id } = useParams()

    const [form, setForm] = useState<FormWithQuestions | null>(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function getQuestions() {
            try {
                const form = await formsAPI.getById(id as string)
                setForm(form)
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    const msg = err.response.data?.error ?? "Произошла ошибка";
                    console.log(msg);
                    setMessage(msg);
                }
            }
        }

        getQuestions()
    }, [])


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