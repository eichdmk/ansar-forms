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
import { CSS } from "@dnd-kit/utilities"



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
        <li ref={setNodeRef} style={style} className={styles.card} {...attributes}>
            <div className={styles.dragHandleRow}>
                <span
                    className={styles.dragHandle}
                    {...listeners}
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
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

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

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) return
        if (!id) return

        const oldIndex = questions.findIndex(q => q.id === active.id)
        const newIndex = questions.findIndex(q => q.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const newOrder = arrayMove(questions, oldIndex, newIndex)
        dispatch(setQuestions(newOrder))

        try {
            setMessage("")

            const toUpdate = newOrder
                .map((q, newIndex) => {
                    const oldIndex = questions.findIndex((oq) => oq.id === q.id)
                    if (oldIndex === newIndex) return null
                    return { q, newIndex }
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

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={questions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className={styles.list}>
                                    {questions.map((q) => (
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
