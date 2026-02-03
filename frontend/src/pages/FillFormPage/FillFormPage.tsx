import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi, responsesAPI } from "../../api"
import type { Form, Question, CreateResponseDto } from "../../types"
import type { AxiosError } from "axios"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import styles from "./FillFormPage.module.css"

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
        return <p className={styles.errorOnly}>{message}</p>
    }

    if (!form) {
        return <p className={styles.loading}>Загрузка...</p>
    }

    if (success) {
        return (
            <div className={styles.page}>
                <div className={styles.successCard}>
                    <h1 className={styles.successTitle}>Спасибо!</h1>
                    <p className={styles.successText}>Ваши ответы успешно отправлены.</p>
                </div>
            </div>
        )
    }

    const opts = (q: Question) =>
        Array.isArray(q.options) ? q.options : q.options ? [String(q.options)] : []

    return (
        <div className={styles.page}>
            <div className={styles.headerCard}>
                <h1 className={styles.title}>{form.title}</h1>
                {form.description && (
                    <p className={styles.description}>{form.description}</p>
                )}
                {!form.is_published && (
                    <p className={styles.warning}>
                        Форма не опубликована. Ответы пока не принимаются.
                    </p>
                )}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <ul className={styles.questionList}>
                    {questions.map((q) => {
                        const typeLabel =
                            QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type
                        const options = opts(q)
                        const value = answers[q.id]
                        const valueStr =
                            typeof value === "string"
                                ? value
                                : Array.isArray(value)
                                  ? value.join(",")
                                  : ""

                        return (
                            <li key={q.id} className={styles.questionItem}>
                                <p className={styles.questionLabel}>
                                    {q.label}
                                    {q.required && <span className={styles.requiredStar}> *</span>}
                                </p>
                                <p className={styles.typeLabel}>{typeLabel}</p>

                                {q.type === "text" && (
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
                                    />
                                )}
                                {q.type === "textarea" && (
                                    <textarea
                                        className={styles.textarea}
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
                                        rows={4}
                                    />
                                )}
                                {q.type === "radio" && (
                                    <div className={styles.radioGroup}>
                                        {options.map((opt) => (
                                            <label
                                                key={String(opt)}
                                                className={styles.radioLabel}
                                            >
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={String(opt)}
                                                    checked={value === String(opt)}
                                                    onChange={() =>
                                                        setAnswer(q.id, String(opt))
                                                    }
                                                />{" "}
                                                {String(opt)}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {q.type === "checkbox" && (
                                    <div className={styles.checkboxGroup}>
                                        {options.map((opt) => {
                                            const arr = Array.isArray(value)
                                                ? value
                                                : value
                                                  ? [value]
                                                  : []
                                            const checked = arr.includes(String(opt))
                                            return (
                                                <label
                                                    key={String(opt)}
                                                    className={styles.checkboxLabel}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={String(opt)}
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const next = e.target.checked
                                                                ? [...arr, String(opt)]
                                                                : arr.filter(
                                                                      (x) => x !== String(opt)
                                                                  )
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
                                        className={styles.select}
                                        value={valueStr}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        required={q.required}
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

                {message && <p className={styles.error}>{message}</p>}

                <div className={styles.submitWrap}>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting || !form.is_published}
                >
                    {submitting ? "Отправка…" : "Отправить"}
                </button>
                </div>
            </form>
        </div>
    )
}
