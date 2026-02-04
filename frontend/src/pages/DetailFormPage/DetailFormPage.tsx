import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form, Question } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions, updateQuestion } from "../../store/slices/questionSlices"
import { QuestionConstructor, questionToDraft } from "../../components/QuestionConstructor/QuestionConstructor"
import { QuestionTypesToolbar } from "./QuestionTypesToolbar"
import { QuestionListItem } from "./QuestionListItem"
import styles from "./DetailFormPage.module.css"

export function DetailFormPage() {
    const { id } = useParams()
    const [form, setForm] = useState<Form | null>(null)
    const [message, setMessage] = useState("")
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [editDraft, setEditDraft] = useState<ReturnType<typeof questionToDraft> | null>(null)
    const [sidebarQuestionType, setSidebarQuestionType] = useState<string | null>(null)
    const [formTitle, setFormTitle] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [formSaving, setFormSaving] = useState(false)
    const questions = useAppSelector(state => state.questions.questions)
    const dispatch = useDispatch()

    useEffect(() => {
        if (form) {
            setFormTitle(form.title)
            setFormDescription(form.description ?? "")
        }
    }, [form])

    useEffect(() => {
        async function loadFormAndQuestions() {
            if (!id) return
            dispatch(setQuestions([]))
            try {
                const [fResult, qResult] = await Promise.all([
                    formsAPI.getById(id),
                    questionsApi.getByFormId(id),
                ])
                setForm(fResult)
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

    async function handleSaveForm() {
        if (!id || !form) return
        setFormSaving(true)
        setMessage("")
        try {
            const updated = await formsAPI.update(id, {
                title: formTitle.trim() || form.title,
                description: formDescription.trim() || undefined,
            })
            setForm(updated)
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data?.error ?? "Произошла ошибка")
            }
        } finally {
            setFormSaving(false)
        }
    }

    const [isMobileToolbar, setIsMobileToolbar] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 900px)")
        const handler = () => setIsMobileToolbar(mq.matches)
        handler()
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const toolbarContent = (
        <QuestionTypesToolbar onSelectType={setSidebarQuestionType} />
    )

    return (
        <div className={styles.page}>
            <div className={styles.scrollArea}>
                <div className={styles.contentWrap}>
                    <main className={styles.main}>
                        {form && (
                            <div className={styles.headerCard}>
                                <input
                                    className={styles.formTitleInput}
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Название формы"
                                    aria-label="Название формы"
                                />
                                <input
                                    className={styles.formDescriptionInput}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Описание формы (необязательно)"
                                    aria-label="Описание формы"
                                />
                                <div className={styles.formHeaderActions}>
                                    <button
                                        type="button"
                                        className={styles.formSaveBtn}
                                        onClick={handleSaveForm}
                                        disabled={formSaving}
                                    >
                                        {formSaving ? "Сохранение…" : "Сохранить"}
                                    </button>
                                </div>
                            </div>
                        )}
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
                            {questions.map((q) => (
                                <QuestionListItem
                                    key={q.id}
                                    question={q}
                                    isEditing={editingQuestionId === q.id}
                                    draft={editingQuestionId === q.id ? editDraft : null}
                                    onDraftChange={setEditDraft}
                                    onSave={handleSaveQuestion}
                                    onCancel={cancelEditing}
                                    onEdit={() => startEditing(q)}
                                    onDelete={() => handleDelete(q.id)}
                                />
                            ))}
                        </ul>

                        {message && <p className={styles.message}>{message}</p>}
                    </main>

                    {isMobileToolbar
                        ? createPortal(toolbarContent, document.body)
                        : toolbarContent}
                </div>
            </div>
        </div>
    )
}
