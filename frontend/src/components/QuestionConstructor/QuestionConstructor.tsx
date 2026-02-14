import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { addQuestion } from "../../store/slices/questionSlices"
import { questionsApi } from "../../api"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import type { AxiosError } from "axios"
import type { Question } from "../../types"
import styles from "./QuestionConstructor.module.css"

export type QuestionDraft = {
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

export function hasDuplicateOptions(options: string[]): boolean {
    const filled = options.map((o) => o.trim()).filter(Boolean)
    const lower = filled.map((o) => o.toLowerCase())
    return lower.length > 0 && new Set(lower).size !== lower.length
}

export function questionToDraft(q: Question): QuestionDraft {
    const opts = Array.isArray(q.options)
        ? q.options.map(String)
        : q.options != null
            ? [String(q.options)]
            : []
    return {
        type: q.type,
        label: q.label,
        required: q.required,
        options: ['radio', 'checkbox', 'select'].includes(q.type) && opts.length === 0 ? ['', ''] : opts,
    }
}

type QuestionConstructorProps = {
    formId: string
    questionsCount: number
    onError?: (message: string) => void
    onQuestionAdded?: (questionId: string) => void
    onOpen?: () => void
    openWithType?: string | null
    onOpenWithTypeConsumed?: () => void
    showTypeButtons?: boolean
}

export function QuestionConstructor({ formId, questionsCount, onError, onQuestionAdded, onOpen, openWithType, onOpenWithTypeConsumed, showTypeButtons = true }: QuestionConstructorProps) {
    const [newQuestionDraft, setNewQuestionDraft] = useState<QuestionDraft | null>(null)
    const dispatch = useDispatch()

    useEffect(() => {
        if (openWithType) {
            setNewQuestionDraft(initialDraft(openWithType))
            onOpenWithTypeConsumed?.()
        }
    }, [openWithType, onOpenWithTypeConsumed])

    useEffect(() => {
        if (newQuestionDraft) onOpen?.()
    }, [newQuestionDraft, onOpen])

    const needsOptions = newQuestionDraft != null && ['radio', 'checkbox', 'select'].includes(newQuestionDraft.type)

    async function handleAddQuestion() {
        if (!newQuestionDraft) return
        const opts = newQuestionDraft.options.filter(Boolean)
        if (needsOptions && opts.length > 0 && hasDuplicateOptions(newQuestionDraft.options)) {
            onError?.('Варианты ответа должны быть уникальными. Удалите дубликаты.')
            return
        }
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
            onQuestionAdded?.(result.id)
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response && onError) {
                onError(err.response.data?.error ?? "Произошла ошибка")
            }
        }
    }

    return (
        <>
            {showTypeButtons && (
                <div className={styles.typeButtons}>
                    {QUESTION_TYPES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            className={styles.typeButton}
                            onClick={() => setNewQuestionDraft(initialDraft(t.value))}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            {newQuestionDraft && (
                <div className={styles.card}>
                    <div className={styles.typeLabelBlock}>
                        <p className={styles.typeLabel}>
                            <strong>Тип вопроса:</strong>{" "}
                            {QUESTION_TYPES.find((t) => t.value === newQuestionDraft.type)?.label}
                        </p>
                        {newQuestionDraft.type === 'radio' && (
                            <p className={styles.typeHint}>Респондент выберет один вариант (○ кружок)</p>
                        )}
                        {newQuestionDraft.type === 'checkbox' && (
                            <p className={styles.typeHint}>Респондент может выбрать несколько вариантов (☐ галочка)</p>
                        )}
                        {newQuestionDraft.type === 'select' && (
                            <p className={styles.typeHint}>Респондент выберет один вариант из выпадающего списка (▼)</p>
                        )}
                    </div>
                    <input
                        className={styles.input}
                        placeholder="Текст вопроса"
                        value={newQuestionDraft.label}
                        onChange={(e) =>
                            setNewQuestionDraft((prev) =>
                                prev ? { ...prev, label: e.target.value } : null
                            )
                        }
                    />
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={newQuestionDraft.required}
                            onChange={(e) =>
                                setNewQuestionDraft((prev) =>
                                    prev ? { ...prev, required: e.target.checked } : null
                                )
                            }
                        />{" "}
                        Обязательный вопрос
                    </label>
                    {needsOptions && (
                        <div className={styles.optionsBlock}>
                            <strong>Варианты ответа:</strong>
                            {hasDuplicateOptions(newQuestionDraft.options) && (
                                <p className={styles.optionsDuplicateHint}>Варианты должны отличаться друг от друга</p>
                            )}
                            {newQuestionDraft.options.map((opt, i) => (
                                <div key={i} className={styles.optionRow}>
                                    <span className={styles.optionTypeIndicator} aria-hidden>
                                        {newQuestionDraft.type === 'radio' && <span className={styles.radioCircle} />}
                                        {newQuestionDraft.type === 'checkbox' && <span className={styles.checkboxSquare} />}
                                        {newQuestionDraft.type === 'select' && <span className={styles.selectArrow}>▼</span>}
                                    </span>
                                    <input
                                        className={styles.optionInput}
                                        value={opt}
                                        onChange={(e) => {
                                            const next = [...newQuestionDraft.options]
                                            next[i] = e.target.value
                                            setNewQuestionDraft((prev) =>
                                                prev ? { ...prev, options: next } : null
                                            )
                                        }}
                                        placeholder={`Вариант ${i + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className={styles.buttonSecondary}
                                        onClick={() =>
                                            setNewQuestionDraft((prev) =>
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
                                    setNewQuestionDraft((prev) =>
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
                            onClick={() => setNewQuestionDraft(null)}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className={styles.buttonPrimary}
                            onClick={handleAddQuestion}
                        >
                            Добавить вопрос
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
