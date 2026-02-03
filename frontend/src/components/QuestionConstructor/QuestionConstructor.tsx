import { useState } from "react"
import { useDispatch } from "react-redux"
import { addQuestion } from "../../store/slices/questionSlices"
import { questionsApi } from "../../api"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import type { AxiosError } from "axios"

type QuestionDraft = {
    type: string
    label: string
    required: boolean
    options: string[]
}

const initialDraft = (type: string): QuestionDraft => ({
    type,
    label: '',
    required: false,
    options: ['radio', 'checkbox', 'select'].includes(type) ? ['', ''] : [],
})

type QuestionConstructorProps = {
    formId: string
    questionsCount: number
    onError?: (message: string) => void
}

export function QuestionConstructor({ formId, questionsCount, onError }: QuestionConstructorProps) {
    const [newQuestionDraft, setNewQuestionDraft] = useState<QuestionDraft | null>(null)
    const dispatch = useDispatch()

    const needsOptions = newQuestionDraft && ['radio', 'checkbox', 'select'].includes(newQuestionDraft.type)

    async function handleAddQuestion() {
        if (!newQuestionDraft) return
        const opts = newQuestionDraft.options.filter(Boolean)
        const dto = {
            type: newQuestionDraft.type,
            label: newQuestionDraft.label,
            required: newQuestionDraft.required,
            order: questionsCount,
            options: needsOptions ? (opts.length ? opts : null) : null,
        }
        try {
            const result = await questionsApi.create(formId, dto)
            dispatch(addQuestion(result))
            setNewQuestionDraft(null)
            onError?.('')
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response && onError) {
                onError(err.response.data?.error ?? "Произошла ошибка")
            }
        }
    }

    return (
        <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {QUESTION_TYPES.map(t => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => setNewQuestionDraft(initialDraft(t.value))}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {newQuestionDraft && (
                <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, borderRadius: 8 }}>
                    <p><strong>Тип:</strong> {QUESTION_TYPES.find(t => t.value === newQuestionDraft.type)?.label}</p>
                    <div style={{ marginBottom: 8 }}>
                        <input
                            placeholder="Текст вопроса"
                            value={newQuestionDraft.label}
                            onChange={e => setNewQuestionDraft(prev => prev ? { ...prev, label: e.target.value } : null)}
                            style={{ width: '100%', maxWidth: 400 }}
                        />
                    </div>
                    <label style={{ display: 'block', marginBottom: 8 }}>
                        <input
                            type="checkbox"
                            checked={newQuestionDraft.required}
                            onChange={e => setNewQuestionDraft(prev => prev ? { ...prev, required: e.target.checked } : null)}
                        />
                        Обязательный вопрос
                    </label>
                    {needsOptions && (
                        <div style={{ marginBottom: 12 }}>
                            <strong>Варианты ответа:</strong>
                            {newQuestionDraft.options.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    <input
                                        value={opt}
                                        onChange={e => {
                                            const next = [...newQuestionDraft.options]
                                            next[i] = e.target.value
                                            setNewQuestionDraft(prev => prev ? { ...prev, options: next } : null)
                                        }}
                                        placeholder={`Вариант ${i + 1}`}
                                        style={{ flex: 1, maxWidth: 300 }}
                                    />
                                    <button type="button" onClick={() => setNewQuestionDraft(prev => prev ? { ...prev, options: prev.options.filter((_, j) => j !== i) } : null)}>−</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setNewQuestionDraft(prev => prev ? { ...prev, options: [...prev.options, ''] } : null)} style={{ marginTop: 8 }}>+ Добавить вариант</button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => setNewQuestionDraft(null)}>Отмена</button>
                        <button type="button" onClick={handleAddQuestion}>Добавить вопрос</button>
                    </div>
                </div>
            )}
        </>
    )
}
