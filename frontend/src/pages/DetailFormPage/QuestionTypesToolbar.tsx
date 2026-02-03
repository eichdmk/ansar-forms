import { QUESTION_TYPES } from "../../constants/questionTypes"
import { getQuestionTypeIcon } from "../../components/QuestionTypeIcons/QuestionTypeIcons"
import styles from "./DetailFormPage.module.css"

type QuestionTypesToolbarProps = {
    onSelectType: (type: string) => void
}

export function QuestionTypesToolbar({ onSelectType }: QuestionTypesToolbarProps) {
    return (
        <aside className={styles.sidebar} aria-label="Добавить элемент">
            <div className={styles.sidebarTitle}>Добавить вопрос</div>
            {QUESTION_TYPES.map((t) => (
                <button
                    key={t.value}
                    type="button"
                    className={styles.sidebarBtn}
                    onClick={() => onSelectType(t.value)}
                    title={t.label}
                >
                    <span className={styles.sidebarIcon}>
                        {getQuestionTypeIcon(t.value)}
                    </span>
                    <span className={styles.sidebarLabel}>{t.label}</span>
                </button>
            ))}
        </aside>
    )
}
