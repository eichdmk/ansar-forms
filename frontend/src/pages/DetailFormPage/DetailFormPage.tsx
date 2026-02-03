import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions } from "../../store/slices/questionSlices"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import { QuestionConstructor } from "../../components/QuestionConstructor/QuestionConstructor"

export function DetailFormPage() {
    const { id } = useParams()

    const [form, setForm] = useState<Form | null>(null)
    const [message, setMessage] = useState('')
    const questions = useAppSelector(state => state.questions.questions)
    const dispatch = useDispatch()

    useEffect(() => {
        async function loadFormAndQuestions() {
            if (!id) return
            dispatch(setQuestions([]))
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
    }, [id, dispatch])

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
            <p>{form?.description}</p>

            {id && (
                <QuestionConstructor
                    formId={id}
                    questionsCount={questions.length}
                    onError={setMessage}
                />
            )}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {questions.map(q => (
                    <li key={q.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8, borderRadius: 6 }}>
                        <p><strong>{q.label}</strong> {q.required && '(обязательный)'}</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{QUESTION_TYPES.find(t => t.value === q.type)?.label ?? q.type}</p>
                        {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Варианты: {q.options.join(', ')}</p>
                        )}
                        <button type="button" onClick={() => handleDelete(q.id)}>Удалить</button>
                    </li>
                ))}
            </ul>

            {message && <p>{message}</p>}
        </>
    )
}