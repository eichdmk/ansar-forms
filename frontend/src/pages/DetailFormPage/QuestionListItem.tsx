import type { Question } from "../../types"
import type { QuestionDraft } from "../../components/QuestionConstructor/QuestionConstructor"
import { QUESTION_TYPES } from "../../constants/questionTypes"
import styles from "./DetailFormPage.module.css"

type QuestionListItemProps = {
    question: Question
    isEditing: boolean
    draft: QuestionDraft | null
    onDraftChange: (draft: QuestionDraft | null) => void
    onSave: () => void
    onCancel: () => void
    onEdit: () => void
    onDelete: () => void
    renderAs?: 'li' | 'div'
    readOnly?: boolean
}

export function QuestionListItem({
    question,
    isEditing,
    draft,
    onDraftChange,
    onSave,
    onCancel,
    onEdit,
    onDelete,
    renderAs = 'li',
    readOnly = false
}: QuestionListItemProps) {
    const needsOptions =
        draft != null && ["radio", "checkbox", "select"].includes(draft.type)

        const Wrapper = renderAs === 'div' ? 'div' : 'li'
    if (isEditing && draft) {
        return (
            <Wrapper className={renderAs === 'li' ? styles.card : undefined}>
                <p className={styles.typeLabel}>
                    {QUESTION_TYPES.find((t) => t.value === draft.type)?.label}
                </p>
                <input
                    className={styles.input}
                    placeholder="Вопрос"
                    value={draft.label}
                    onChange={(e) =>
                        onDraftChange(
                            draft ? { ...draft, label: e.target.value } : null
                        )
                    }
                />
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={draft.required}
                        onChange={(e) =>
                            onDraftChange(
                                draft
                                    ? { ...draft, required: e.target.checked }
                                    : null
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
                                        onDraftChange(
                                            draft
                                                ? { ...draft, options: next }
                                                : null
                                        )
                                    }}
                                    placeholder={`Вариант ${i + 1}`}
                                />
                                <button
                                    type="button"
                                    className={styles.optionRemove}
                                    onClick={() =>
                                        onDraftChange(
                                            draft
                                                ? {
                                                      ...draft,
                                                      options: draft.options.filter(
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
                                onDraftChange(
                                    draft
                                        ? {
                                              ...draft,
                                              options: [...draft.options, ""],
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
                        onClick={onCancel}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        className={styles.buttonPrimary}
                        onClick={onSave}
                    >
                        Сохранить
                    </button>
                </div>
            </Wrapper>
        )
    }

    return (
        <Wrapper className={renderAs === 'li' ? styles.card : undefined}>
            <p className={styles.questionLabel}>
                {question.label}
                {question.required && (
                    <span className={styles.requiredStar}> *</span>
                )}
            </p>
            <p className={styles.meta}>
                {QUESTION_TYPES.find((t) => t.value === question.type)?.label ??
                    question.type}
            </p>
            {question.options &&
                Array.isArray(question.options) &&
                question.options.length > 0 && (
                    <p className={styles.optionsMeta}>
                        {question.options.join(", ")}
                    </p>
                )}
            {!readOnly && (
                <div className={styles.cardActions}>
                    <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={onEdit}
                    >
                        Редактировать
                    </button>
                    <button
                        type="button"
                        className={styles.buttonDanger}
                        onClick={onDelete}
                    >
                        Удалить
                    </button>
                </div>
            )}
        </Wrapper>
    )
}
