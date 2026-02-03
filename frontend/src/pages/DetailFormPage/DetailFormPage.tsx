import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { formsAPI, questionsApi } from "../../api"
import type { Form, Question } from "../../types"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { deleteQuestion, setQuestions, updateQuestion } from "../../store/slices/questionSlices"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import { QuestionConstructor, questionToDraft } from "../../components/QuestionConstructor/QuestionConstructor"

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
                {questions.map(q => {
                    const isEditing = editingQuestionId === q.id
                    const draft = isEditing ? editDraft : null
                    const needsOptions = draft != null && ['radio', 'checkbox', 'select'].includes(draft.type)

                    return (
                        <li key={q.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8, borderRadius: 6 }}>
                            {isEditing && draft ? (
                                <>
                                    <p style={{ margin: '0 0 8px', fontSize: 14, color: '#666' }}><strong>Тип:</strong> {QUESTION_TYPES.find(t => t.value === draft.type)?.label}</p>
                                    <div style={{ marginBottom: 8 }}>
                                        <input
                                            placeholder="Текст вопроса"
                                            value={draft.label}
                                            onChange={e => setEditDraft(prev => prev ? { ...prev, label: e.target.value } : null)}
                                            style={{ width: '100%', maxWidth: 400 }}
                                        />
                                    </div>
                                    <label style={{ display: 'block', marginBottom: 8 }}>
                                        <input
                                            type="checkbox"
                                            checked={draft.required}
                                            onChange={e => setEditDraft(prev => prev ? { ...prev, required: e.target.checked } : null)}
                                        />
                                        Обязательный вопрос
                                    </label>
                                    {needsOptions && (
                                        <div style={{ marginBottom: 12 }}>
                                            <strong>Варианты ответа:</strong>
                                            {draft.options.map((opt, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                                    <input
                                                        value={opt}
                                                        onChange={e => {
                                                            const next = [...draft.options]
                                                            next[i] = e.target.value
                                                            setEditDraft(prev => prev ? { ...prev, options: next } : null)
                                                        }}
                                                        placeholder={`Вариант ${i + 1}`}
                                                        style={{ flex: 1, maxWidth: 300 }}
                                                    />
                                                    <button type="button" onClick={() => setEditDraft(prev => prev ? { ...prev, options: prev.options.filter((_, j) => j !== i) } : null)}>−</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => setEditDraft(prev => prev ? { ...prev, options: [...prev.options, ''] } : null)} style={{ marginTop: 8 }}>+ Добавить вариант</button>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button type="button" onClick={cancelEditing}>Отмена</button>
                                        <button type="button" onClick={handleSaveQuestion}>Сохранить</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong>{q.label}</strong> {q.required && '(обязательный)'}</p>
                                    <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{QUESTION_TYPES.find(t => t.value === q.type)?.label ?? q.type}</p>
                                    {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                                        <p style={{ margin: '4px 0 0', fontSize: 13 }}>Варианты: {q.options.join(', ')}</p>
                                    )}
                                    <button type="button" onClick={() => startEditing(q)}>Редактировать</button>
                                    <button type="button" onClick={() => handleDelete(q.id)}>Удалить</button>
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>

            {message && <p>{message}</p>}
        </>
    )
}