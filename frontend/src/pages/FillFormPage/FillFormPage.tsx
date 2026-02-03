import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi, responsesAPI } from "../../api"
import type { Form, Question, CreateResponseDto } from "../../types"
import type { AxiosError } from "axios"
import { QUESTION_TYPES } from "../../constants/questionTypes"

type AnswerValue = string | string[]

export function FillFormPage() {
    const { id } = useParams()
    const [form, setForm] = useState<Form | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
    const [message, setMessage] = useState("")
    const [success, setSuccess] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function load() {
            if (!id) return
            try {
                const [formData, questionsData] = await Promise.all([
                    formsAPI.getById(id),
                    questionsApi.getByFormId(id),
                ])
                setForm(formData)
                setQuestions(questionsData ?? [])
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    setMessage(err.response.data?.error ?? "Форма не найдена")
                }
            }
        }
        load()
    }, [id])

    const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }))
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id || !form) return
        setMessage("")
        setSubmitting(true)
        try {
            const dto: CreateResponseDto = {
                answers: Object.entries(answers).map(([questionId, value]) => ({
                    questionId,
                    value,
                })),
            }
            await responsesAPI.submit(id, dto)
            setSuccess(true)
            setAnswers({})
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            setMessage(err.response?.data?.error ?? "Ошибка при отправке")
        } finally {
            setSubmitting(false)
        }
    }

    if (message && !form) {
        return <p>{message}</p>
    }

    if (!form) {
        return <p>Загрузка...</p>
    }

    if (success) {
        return (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
                <h1>Спасибо!</h1>
                <p>Ваши ответы успешно отправлены.</p>
            </div>
        )
    }

    const opts = (q: Question) =>
        Array.isArray(q.options) ? q.options : q.options ? [String(q.options)] : []

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
            <h1>{form.title}</h1>
            {form.description && (
                <p style={{ color: "#666", marginBottom: 24 }}>{form.description}</p>
            )}

            {!form.is_published && (
                <p style={{ color: "#c00", marginBottom: 16 }}>
                    Форма не опубликована. Ответы пока не принимаются.
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {questions.map((q) => {
                        const typeLabel =
                            QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type
                        const options = opts(q)
                        const value = answers[q.id]
                        const valueStr = typeof value === "string" ? value : (Array.isArray(value) ? value.join(",") : "")

                        return (
                            <li
                                key={q.id}
                                style={{
                                    marginBottom: 20,
                                    paddingBottom: 16,
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <p style={{ margin: "0 0 4px", fontWeight: 500 }}>
                                    {q.label}
                                    {q.required && <span style={{ color: "#c00" }}> *</span>}
                                </p>
                                <p style={{ margin: 0, fontSize: 14, color: "#888" }}>
                                    {typeLabel}
                                </p>

                                {q.type === "text" && (
                                    <input
                                        type="text"
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
                                        style={{ width: "100%", padding: 8, marginTop: 8 }}
                                    />
                                )}
                                {q.type === "textarea" && (
                                    <textarea
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
                                        rows={4}
                                        style={{ width: "100%", padding: 8, marginTop: 8 }}
                                    />
                                )}
                                {q.type === "radio" && (
                                    <div style={{ marginTop: 8 }}>
                                        {options.map((opt) => (
                                            <label key={String(opt)} style={{ display: "block", marginBottom: 4 }}>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={String(opt)}
                                                    checked={value === String(opt)}
                                                    onChange={() => setAnswer(q.id, String(opt))}
                                                />{" "}
                                                {String(opt)}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {q.type === "checkbox" && (
                                    <div style={{ marginTop: 8 }}>
                                        {options.map((opt) => {
                                            const arr = Array.isArray(value) ? value : value ? [value] : []
                                            const checked = arr.includes(String(opt))
                                            return (
                                                <label key={String(opt)} style={{ display: "block", marginBottom: 4 }}>
                                                    <input
                                                        type="checkbox"
                                                        value={String(opt)}
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = e.target.checked
                                                                ? [...arr, String(opt)]
                                                                : arr.filter((x) => x !== String(opt))
                                                            setAnswer(q.id, next)
                                                        }}
                                                    />{" "}
                                                    {String(opt)}
                                                </label>
                                            )
                                        })}
                                    </div>
                                )}
                                {q.type === "select" && (
                                    <select
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
                                        style={{ width: "100%", padding: 8, marginTop: 8 }}
                                    >
                                        <option value="">— Выберите —</option>
                                        {options.map((opt) => (
                                            <option key={String(opt)} value={String(opt)}>
                                                {String(opt)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </li>
                        )
                    })}
                </ul>

                {message && (
                    <p style={{ color: "#c00", marginBottom: 16 }}>{message}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting || !form.is_published}
                    style={{ padding: "10px 24px", fontSize: 16 }}
                >
                    {submitting ? "Отправка…" : "Отправить"}
                </button>
            </form>
        </div>
    )
}
