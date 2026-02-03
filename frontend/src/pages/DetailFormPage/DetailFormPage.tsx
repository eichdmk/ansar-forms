import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions } from "../../store/slices/questionSlices"

export function DetailFormPage() {
    const { id } = useParams()

    const [form, setForm] = useState<Form | null>(null)
    const [message, setMessage] = useState('')
    const questions = useAppSelector(state => state.questions.questions)
    const dispatch = useDispatch()

    useEffect(() => {
        async function loadFormAndQuestions() {
            if (!id) return
            try {
                const fResult = await formsAPI.getById(id)
                setForm(fResult)
                const qResult = await questionsApi.getByFormId(id)
                dispatch(setQuestions(qResult))
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    setMessage(err.response.data?.error ?? "Произошла ошибка")
                }
            }
        }

        loadFormAndQuestions()
    }, [id])


    async function handleDelete(Qid: string) {
        try {
            await questionsApi.delete(Qid, id as string)
            dispatch(deleteQuestion(Qid))
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data?.error ?? "Произошла ошибка")
            }
        }
    }


    return (
        <>
            <h1>{form?.title}</h1>
            {form?.description}
            {questions.map(q => {
                return <li key={q.id}>
                    <p>{q.label}</p>
                    <p>{q.options}</p>
                    <p>{q.required}</p>
                    <p>{q.type}</p>
                    <button onClick={() => handleDelete(q.id)}>Удалить</button>
                </li>
            })}

            <p>{message && <p>{message}</p>}</p>
        </>
    )
}