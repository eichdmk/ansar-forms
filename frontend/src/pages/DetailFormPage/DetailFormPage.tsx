import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useParams, Link } from "react-router-dom"
import { formsAPI, questionsApi, responsesAPI } from "../../api"
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
    const [responseCount, setResponseCount] = useState(0)
    const [message, setMessage] = useState("")
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<ReturnType<typeof questionToDraft> | null>(null)
    const [sidebarQuestionType, setSidebarQuestionType] = useState<string | null>(null)
    const questions = useAppSelector(state => state.questions.questions)
    const dispatch = useDispatch()

    useEffect(() => {
        async function loadFormAndQuestions() {
            if (!id) return
            dispatch(setQuestions([]))
            try {
                const [fResult, qResult, responsesRes] = await Promise.all([
                    formsAPI.getById(id),
                    questionsApi.getByFormId(id),
                    responsesAPI.getByFormId(id, 1, 1).catch(() => ({ total: 0, items: [], page: 1, limit: 1 })),
                ])
                setForm(fResult)
                dispatch(setQuestions(qResult))
                setResponseCount(responsesRes.total ?? 0)
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    setMessage(err.response.data?.error ?? "Произошла ошибка")
                }
            }
        }
        loadFormAndQuestions()
    }, [id, dispatch])

    const handleOpenWithTypeConsumed = useCallback(() => {
        setSidebarQuestionType(null)
    }, [])

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
        const needsOptions = ["radio", "checkbox", "select"].includes(editDraft.type)
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
            setMessage("")
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

    const fillUrl = id ? `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${id}/fill` : ""

    const [isMobileToolbar, setIsMobileToolbar] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 900px)")
        const handler = () => setIsMobileToolbar(mq.matches)
        handler()
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const toolbarContent = (
        <aside className={styles.sidebar} aria-label="Добавить элемент">
            <div className={styles.sidebarTitle}>Добавить вопрос</div>
            {QUESTION_TYPES.map((t) => (
                <button
                    key={t.value}
                    type="button"
                    className={styles.sidebarBtn}
                    onClick={() => setSidebarQuestionType(t.value)}
                    title={t.label}
                >
                    <span className={styles.sidebarIcon}>
                        {t.value === "text" && "▭"}
                        {t.value === "textarea" && "¶"}
                        {t.value === "radio" && "○"}
                        {t.value === "checkbox" && "☑"}
                        {t.value === "select" && "▾"}
                    </span>
                    <span className={styles.sidebarLabel}>{t.label}</span>
                </button>
            ))}
        </aside>
    )

    return (
        <div className={styles.page}>
            {/* Top bar like Google Forms */}
            <header className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <h1 className={styles.topBarTitle}>{form?.title ?? "Форма"}</h1>
                </div>
                <nav className={styles.tabs} aria-label="Разделы формы">
                    <span className={styles.tabActive}>Вопросы</span>
                    <Link
                        className={styles.tabLink}
                        to={`/forms/${id}/responses`}
                    >
                        Ответы
                        {responseCount > 0 && (
                            <span className={styles.tabBadge}>{responseCount}</span>
                        )}
                    </Link>
                </nav>
                <div className={styles.topBarRight}>
                    <a
                        className={styles.previewBtn}
                        href={fillUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Просмотр
                    </a>
                    <span
                        className={
                            form?.is_published ? styles.publishBadgeOn : styles.publishBadgeOff
                        }
                    >
                        {form?.is_published ? "Опубликовано" : "Черновик"}
                    </span>
                </div>
            </header>

            <div className={styles.contentWrap}>
                <main className={styles.main}>
                    {/* Form header card */}
                    <div className={styles.headerCard}>
                        <h2 className={styles.formTitle}>{form?.title}</h2>
                        {form?.description && (
                            <p className={styles.formDescription}>{form.description}</p>
                        )}
                    </div>

                    {id && (
                        <QuestionConstructor
                            formId={id}
                            questionsCount={questions.length}
                            onError={setMessage}
                            openWithType={sidebarQuestionType}
                            onOpenWithTypeConsumed={handleOpenWithTypeConsumed}
                            showTypeButtons={false}
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
                                                {QUESTION_TYPES.find((t) => t.value === draft.type)?.label}
                                            </p>
                                            <input
                                                className={styles.input}
                                                placeholder="Вопрос"
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
                                                    <span className={styles.optionsTitle}>Варианты:</span>
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
                                                                className={styles.optionRemove}
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
                                                        className={styles.addOptionBtn}
                                                        onClick={() =>
                                                            setEditDraft((prev) =>
                                                                prev
                                                                    ? { ...prev, options: [...prev.options, ""] }
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
                                                {q.required && (
                                                    <span className={styles.requiredStar}> *</span>
                                                )}
                                            </p>
                                            <p className={styles.meta}>
                                                {QUESTION_TYPES.find((t) => t.value === q.type)?.label ??
                                                    q.type}
                                            </p>
                                            {q.options &&
                                                Array.isArray(q.options) &&
                                                q.options.length > 0 && (
                                                    <p className={styles.optionsMeta}>
                                                        {q.options.join(", ")}
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
                                                    className={styles.buttonDanger}
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
                </main>

                {/* На мобильных панель рендерится в body (sticky внизу), на десктопе — справа */}
                {isMobileToolbar ? createPortal(toolbarContent, document.body) : toolbarContent}
            </div>
        </div>
    )
}
