import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form, Question } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions, updateQuestion } from "../../store/slices/questionSlices"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import { QuestionConstructor, questionToDraft } from "../../components/QuestionConstructor/QuestionConstructor"
import styles from "./DetailFormPage.module.css"

export function DetailFormPage() {
    const { id } = useParams()

    const [form, setForm] = useState<Form | null>(null)
    const [message, setMessage] = useState('')
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<ReturnType<typeof questionToDraft> | null>(null)
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

    function startEditing(q: Question) {
        setEditingQuestionId(q.id)
        setEditDraft(questionToDraft(q))
    }

    function cancelEditing() {
        setEditingQuestionId(null)
        setEditDraft(null)
    }

    async function handleSaveQuestion() {
        if (!editingQuestionId || !editDraft || !id) return
        const q = questions.find(qq => qq.id === editingQuestionId)
        if (!q) return
        const opts = editDraft.options.filter(Boolean)
        const needsOptions = ['radio', 'checkbox', 'select'].includes(editDraft.type)
        const dto = {
            type: editDraft.type,
            label: editDraft.label,
            required: editDraft.required,
            order: q.order,
            options: needsOptions ? (opts.length ? opts : null) : null,
        }
        try {
            const result = await questionsApi.update(editingQuestionId, id, dto)
            dispatch(updateQuestion(result))
            cancelEditing()
            setMessage('')
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data?.error ?? "Произошла ошибка")
            }
        }
    }

    async function handleDelete(Qid: string) {
        try {
            await questionsApi.delete(Qid, id as string)
            dispatch(deleteQuestion(Qid))
            if (editingQuestionId === Qid) cancelEditing()
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data?.error ?? "Произошла ошибка")
            }
        }
    }

    return (
        <>
            <h1 className={styles.title}>{form?.title}</h1>
            <p className={styles.description}>{form?.description}</p>
            {id && (
                <p className={styles.topActions}>
                    <Link className={styles.responsesLink} to={`/forms/${id}/responses`}>
                        Просмотр ответов
                    </Link>
                </p>
            )}
            {id && (
                <QuestionConstructor
                    formId={id}
                    questionsCount={questions.length}
                    onError={setMessage}
                />
            )}

            <ul className={styles.list}>
                {questions.map((q) => {
                    const isEditing = editingQuestionId === q.id
                    const draft = isEditing ? editDraft : null
                    const needsOptions =
                        draft != null && ["radio", "checkbox", "select"].includes(draft.type)

                    return (
                        <li key={q.id} className={styles.card}>
                            {isEditing && draft ? (
                                <>
                                    <p className={styles.typeLabel}>
                                        <strong>Тип:</strong>{" "}
                                        {QUESTION_TYPES.find((t) => t.value === draft.type)?.label}
                                    </p>
                                    <input
                                        className={styles.input}
                                        placeholder="Текст вопроса"
                                        value={draft.label}
                                        onChange={(e) =>
                                            setEditDraft((prev) =>
                                                prev ? { ...prev, label: e.target.value } : null
                                            )
                                        }
                                    />
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={draft.required}
                                            onChange={(e) =>
                                                setEditDraft((prev) =>
                                                    prev ? { ...prev, required: e.target.checked } : null
                                                )
                                            }
                                        />{" "}
                                        Обязательный вопрос
                                    </label>
                                    {needsOptions && (
                                        <div className={styles.optionsBlock}>
                                            <strong>Варианты ответа:</strong>
                                            {draft.options.map((opt, i) => (
                                                <div key={i} className={styles.optionRow}>
                                                    <input
                                                        className={styles.optionInput}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const next = [...draft.options]
                                                            next[i] = e.target.value
                                                            setEditDraft((prev) =>
                                                                prev ? { ...prev, options: next } : null
                                                            )
                                                        }}
                                                        placeholder={`Вариант ${i + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={styles.buttonSecondary}
                                                        onClick={() =>
                                                            setEditDraft((prev) =>
                                                                prev
                                                                    ? {
                                                                          ...prev,
                                                                          options: prev.options.filter(
                                                                              (_, j) => j !== i
                                                                          ),
                                                                      }
                                                                    : null
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className={`${styles.buttonSecondary} ${styles.addOptionBtn}`}
                                                onClick={() =>
                                                    setEditDraft((prev) =>
                                                        prev
                                                            ? {
                                                                  ...prev,
                                                                  options: [...prev.options, ""],
                                                              }
                                                            : null
                                                    )
                                                }
                                            >
                                                + Добавить вариант
                                            </button>
                                        </div>
                                    )}
                                    <div className={styles.actions}>
                                        <button
                                            type="button"
                                            className={styles.buttonSecondary}
                                            onClick={cancelEditing}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.buttonPrimary}
                                            onClick={handleSaveQuestion}
                                        >
                                            Сохранить
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className={styles.questionLabel}>
                                        {q.label}
                                        {q.required && <span className={styles.requiredStar}> *</span>}
                                    </p>
                                    <p className={styles.meta}>
                                        {QUESTION_TYPES.find((t) => t.value === q.type)?.label ??
                                            q.type}
                                    </p>
                                    {q.options &&
                                        Array.isArray(q.options) &&
                                        q.options.length > 0 && (
                                            <p className={styles.optionsMeta}>
                                                Варианты: {q.options.join(", ")}
                                            </p>
                                        )}
                                    <div className={styles.cardActions}>
                                        <button
                                            type="button"
                                            className={styles.buttonSecondary}
                                            onClick={() => startEditing(q)}
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.buttonSecondary}
                                            onClick={() => handleDelete(q.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>

            {message && <p className={styles.message}>{message}</p>}
        </>
    )
}