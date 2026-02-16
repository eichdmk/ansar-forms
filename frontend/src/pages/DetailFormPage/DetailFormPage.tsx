import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { useParams, Link } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form, Question } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions, updateQuestion } from "../../store/slices/questionSlices"
import { updateCurrentForm } from "../../store/slices/currentFormSlice"
import { QuestionConstructor, questionToDraft, hasDuplicateOptions } from "../../components/QuestionConstructor/QuestionConstructor"
import { QuestionTypesToolbar } from "./QuestionTypesToolbar"
import { QuestionListItem } from "./QuestionListItem"
import styles from "./DetailFormPage.module.css"
import { CSS } from "@dnd-kit/utilities"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"



function SortableQuestionItem({
    question,
    ...rest
}: {
    question: Question
} & Omit<React.ComponentProps<typeof QuestionListItem>, "question">) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <li ref={setNodeRef} id={`question-${question.id}`} style={style} className={styles.card}>
            <div className={styles.dragHandleRow}>
                <span
                    className={styles.dragHandle}
                    {...listeners}
                    {...attributes}
                    title="Перетащить"
                    aria-label="Перетащить вопрос"
                >
                    ⋮⋮
                </span>
            </div>
            <QuestionListItem question={question} renderAs="div" {...rest} />
        </li>
    )
}


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
    const formFromRedux = useAppSelector(state =>
        state.currentForm.formId === id ? state.currentForm.form : null
    )
    const formFromStore = formFromRedux ?? form
    const formIdRef = useRef<string | undefined>(undefined)
    const lastSavedTitleRef = useRef<string>("")
    const lastSavedDescriptionRef = useRef<string>("")
    const isAutoSavingRef = useRef<boolean>(false)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const questionsLoadedForIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!id) return
        questionsLoadedForIdRef.current = null
        dispatch(setQuestions([]))
    }, [id, dispatch])

    useEffect(() => {
        if (!id || formFromRedux?.id !== id) return
        if (questionsLoadedForIdRef.current === id) return
        questionsLoadedForIdRef.current = id
        setForm(formFromRedux)
        let cancelled = false
        questionsApi.getByFormId(id).then((qResult) => {
            if (!cancelled) dispatch(setQuestions(qResult))
        }).catch((error) => {
            if (!cancelled) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) setMessage(err.response.data?.error ?? "Произошла ошибка")
            }
        })
        return () => { cancelled = true }
    }, [id, formFromRedux, dispatch])

    const canEdit = formFromStore?.role === 'owner' || formFromStore?.role === 'editor'

    useEffect(() => {
        if (!form || !id) return

        if (isAutoSavingRef.current) {
            return
        }

        if (formIdRef.current !== id) {
            formIdRef.current = id
            setFormTitle(form.title)
            setFormDescription(form.description ?? "")
            lastSavedTitleRef.current = form.title
            lastSavedDescriptionRef.current = form.description ?? ""
        }

    }, [form, id])

    useEffect(() => {
        if (!id || !form || !canEdit) return

        if (isAutoSavingRef.current) {
            return
        }

        const titleToSave = formTitle.trim() || form.title
        const descriptionToSave = formDescription.trim()

        const titleChanged = titleToSave !== lastSavedTitleRef.current
        const descriptionChanged = descriptionToSave !== lastSavedDescriptionRef.current

        if (!titleChanged && !descriptionChanged) {
            return
        }

        const timeoutId = setTimeout(async () => {
            if (!id || !form) return

            const finalTitleToSave = formTitle.trim() || form.title
            const finalDescriptionToSave = formDescription.trim()

            if (finalTitleToSave === lastSavedTitleRef.current &&
                finalDescriptionToSave === lastSavedDescriptionRef.current) {
                return
            }

            isAutoSavingRef.current = true
            setFormSaving(true)
            setMessage("")
            try {
                const updated = await formsAPI.update(id, {
                    title: finalTitleToSave,
                    description: finalDescriptionToSave,
                })
                lastSavedTitleRef.current = updated.title
                lastSavedDescriptionRef.current = updated.description ?? ""

                const nextForm = { ...form!, title: updated.title, description: updated.description, updated_at: updated.updated_at || form!.updated_at }
                setForm(nextForm)
                dispatch(updateCurrentForm(nextForm))
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (err.response) {
                    setMessage(err.response.data?.error ?? "Произошла ошибка при сохранении")
                }
            } finally {
                setFormSaving(false)
                setTimeout(() => {
                    isAutoSavingRef.current = false
                }, 100)
            }
        }, 800)

        return () => clearTimeout(timeoutId)
    }, [formTitle, formDescription, id, form, canEdit])

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
        if (needsOptions && opts.length > 0 && hasDuplicateOptions(editDraft.options)) {
            setMessage('Варианты ответа должны быть уникальными. Удалите дубликаты.')
            return
        }
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

    const sortedQuestions = useMemo(
        () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [questions]
    )

    const scrollToQuestion = useCallback((questionId: string) => {
        setTimeout(() => {
            const el = document.getElementById(`question-${questionId}`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 150)
    }, [])

    const scrollToConstructor = useCallback(() => {
        setTimeout(() => {
            const el = document.getElementById('question-constructor-block')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
    }, [])

    const [isMobileToolbar, setIsMobileToolbar] = useState(false)
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 900px)")
        const handler = () => setIsMobileToolbar(mq.matches)
        handler()
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) return
        if (!id) return

        const oldIndex = sortedQuestions.findIndex(q => q.id === active.id)
        const newIndex = sortedQuestions.findIndex(q => q.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const newOrder = arrayMove(sortedQuestions, oldIndex, newIndex)
        const newOrderWithOrder = newOrder.map((q, idx) => ({ ...q, order: idx }))
        dispatch(setQuestions(newOrderWithOrder))

        try {
            setMessage("")

            const toUpdate = newOrder
                .map((q, idx) => {
                    const prevIndex = sortedQuestions.findIndex((oq) => oq.id === q.id)
                    if (prevIndex === idx) return null
                    return { q, newIndex: idx }
                })
                .filter((x): x is { q: Question; newIndex: number } => x !== null)

            if (toUpdate.length > 0) {
                const updates = toUpdate.map(({ q, newIndex }) =>
                    questionsApi.update(q.id, id, {
                        type: q.type,
                        label: q.label,
                        required: q.required,
                        order: newIndex,
                        options: q.options ?? undefined,
                    })
                )
                await Promise.all(updates)
            }
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data?.error ?? "Не удалось сохранить порядок вопросов")
            }
            dispatch(setQuestions(questions))
        }
    }



    const toolbarContent = (
        <QuestionTypesToolbar onSelectType={setSidebarQuestionType} />
    )

    return (
        <div className={styles.page}>
            <div className={styles.scrollArea}>
                <div className={styles.contentWrap}>
                    <main className={styles.main}>
                        {formFromStore && (
                            <div className={styles.headerCard}>
                                {canEdit ? (
                                    <>
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
                                            {formSaving && (
                                                <span className={styles.formSaveStatus}>Сохранение…</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className={styles.formTitleReadOnly}>{formFromStore.title}</h1>
                                        {formFromStore.description && (
                                            <p className={styles.formDescriptionReadOnly}>{formFromStore.description}</p>
                                        )}
                                        {formFromStore.role === 'viewer' && (
                                            <span className={styles.roleBadge}>Только просмотр</span>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {formFromStore && canEdit && (!formFromStore.owner_terms_text || !formFromStore.owner_terms_text.trim()) && (
                            <div className={styles.termsRequiredBlock}>
                                <div className={styles.termsRequiredHint}>
                                    <p className={styles.termsRequiredText}>Чтобы открыть форму для ответов, укажите условия использования в настройках.</p>
                                    {id && (
                                        <Link to={`/forms/edit/${id}/settings`} className={styles.termsRequiredLink}>
                                            Перейти в настройки
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {id && !canEdit && questions.length > 0 && (
                            <p className={styles.viewerQuestionsHint}>Вопросы формы (только просмотр)</p>
                        )}

                        {canEdit ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={sortedQuestions.map(q => q.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <ul className={styles.list}>
                                        {sortedQuestions.map((q) => (
                                            <SortableQuestionItem
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
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <ul className={styles.list}>
                                {sortedQuestions.map((q) => (
                                    <QuestionListItem
                                        key={q.id}
                                        question={q}
                                        renderAs="li"
                                        readOnly
                                        isEditing={false}
                                        draft={null}
                                        onDraftChange={() => { }}
                                        onSave={() => { }}
                                        onCancel={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                    />
                                ))}
                            </ul>
                        )}

                        {id && canEdit && (
                            <div id="question-constructor-block">
                                <QuestionConstructor
                                    formId={id}
                                    questionsCount={questions.length}
                                    onError={setMessage}
                                    onQuestionAdded={scrollToQuestion}
                                    onOpen={scrollToConstructor}
                                    openWithType={sidebarQuestionType}
                                    onOpenWithTypeConsumed={handleOpenWithTypeConsumed}
                                    showTypeButtons={false}
                                />
                            </div>
                        )}

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
