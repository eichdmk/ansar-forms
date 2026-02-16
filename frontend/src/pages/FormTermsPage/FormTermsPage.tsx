import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import DOMPurify from "dompurify"
import { formsAPI } from "../../api"
import type { AxiosError } from "axios"
import styles from "./FormTermsPage.module.css"

const TERMS_ALLOWED_TAGS = ["p", "h1", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i", "a", "br"]
const TERMS_ALLOWED_ATTR = ["href", "target", "rel"]

export function FormTermsPage() {
    const { id } = useParams()
    const [formTitle, setFormTitle] = useState("")
    const [termsText, setTermsText] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!id) return
        setLoading(true)
        setError("")
        formsAPI
            .getFormTerms(id)
            .then(({ form_title, terms_text }) => {
                setFormTitle(form_title)
                setTermsText(terms_text)
            })
            .catch((err: AxiosError<{ error?: string }>) => {
                setError(err.response?.data?.error ?? "Не удалось загрузить условия")
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className={styles.page}>
                <p className={styles.loading}>Загрузка…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.page}>
                <p className={styles.error}>{error}</p>
                {id && (
                    <Link to={`/forms/${id}/fill`} className={styles.backLink}>
                        Вернуться к форме
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{formTitle}</h1>
                <h2 className={styles.termsTitle}>Условия обработки пользовательских данных</h2>
                <div className={styles.termsBody}>
                    {termsText ? (
                        <div
                            className={styles.termsContent}
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(termsText, {
                                    ALLOWED_TAGS: TERMS_ALLOWED_TAGS,
                                    ALLOWED_ATTR: TERMS_ALLOWED_ATTR,
                                }),
                            }}
                        />
                    ) : (
                        <p className={styles.termsEmpty}>
                            Владелец формы не указал дополнительные условия.
                        </p>
                    )}
                </div>
                {id && (
                    <Link to={`/forms/${id}/fill`} className={styles.backLink}>
                        ← Вернуться к форме
                    </Link>
                )}
            </div>
        </div>
    )
}
