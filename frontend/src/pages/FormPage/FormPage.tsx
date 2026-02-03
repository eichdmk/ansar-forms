import { useDispatch } from "react-redux"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useEffect, useState } from "react"
import { formsAPI } from "../../api"
import { deleteForm, setForms, setSelectedForm, updateForm } from "../../store/slices/formSlices"
import { CreateForm } from "../../components/CreateForm/CreateForm"
import type { AxiosError } from "axios"
import { Link } from "react-router-dom"
import type { Form } from "../../types"
import styles from "./FormPage.module.css"

export function FormsPage() {
    const forms = useAppSelector(state => state.forms.forms)
    const [message, setMessage] = useState("")
    const selectedForm = useAppSelector(state => state.forms.selectedForm)
    const dispatch = useDispatch()
    const [copyToast, setCopyToast] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [is_published, setIs_published] = useState(false)

    useEffect(() => {
        if (selectedForm) {
            setTitle(selectedForm.title)
            setDescription(selectedForm.description)
            setIs_published(selectedForm.is_published)
        }
    }, [selectedForm])

    useEffect(() => {
        async function getForms() {
            const result = await formsAPI.getAll()
            dispatch(setForms(result))
        }
        getForms()
    }, [dispatch])

    function getFillLink(formId: string) {
        const base = typeof window !== "undefined" ? window.location.origin : ""
        return `${base}/forms/${formId}/fill`
    }

    async function handleCopyLink(form: Form) {
        const url = getFillLink(form.id)
        try {
            await navigator.clipboard.writeText(url)
            setCopyToast(true)
            setTimeout(() => setCopyToast(false), 2000)
        } catch {
            setMessage("Не удалось скопировать ссылку")
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Удалить эту форму? Это действие нельзя отменить.")) return
        try {
            await formsAPI.delete(id)
            dispatch(deleteForm({ id }))
            if (selectedForm?.id === id) dispatch(setSelectedForm(undefined))
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data.error || "Произошла ошибка")
            }
        }
    }

    async function handleSave() {
        if (!selectedForm) return
        try {
            const result = await formsAPI.update(selectedForm.id, { title, description, is_published })
            dispatch(updateForm(result))
            dispatch(setSelectedForm(undefined))
            setMessage("")
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data.error || "Произошла ошибка")
            }
        }
    }

    return (
        <>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Мои формы</h1>
                <p className={styles.pageSubtitle}>
                    Создавайте формы, добавляйте вопросы и собирайте ответы
                </p>
            </header>

            <CreateForm />

            <h2 className={styles.sectionTitle}>Ваши формы</h2>

            {forms.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyTitle}>Пока нет форм</p>
                    <p className={styles.emptyText}>
                        Создайте первую форму с помощью блока «Новая форма» выше — укажите название и нажмите «Создать форму».
                    </p>
                </div>
            ) : (
                <ul className={styles.grid}>
                    {forms.map((f) => {
                        const isEditing = selectedForm?.id === f.id
                        return (
                            <li key={f.id} className={styles.card}>
                                <div>
                                    <h3 className={styles.cardTitle}>
                                        <Link className={styles.cardTitleLink} to={`/forms/edit/${f.id}`}>
                                            {f.title}
                                        </Link>
                                    </h3>
                                    {f.description && (
                                        <p className={styles.cardDescription}>{f.description}</p>
                                    )}
                                    <span
                                        className={
                                            f.is_published ? styles.badgePublished : styles.badgeDraft
                                        }
                                    >
                                        {f.is_published ? "Опубликовано" : "Черновик"}
                                    </span>
                                </div>

                                {isEditing ? (
                                    <form
                                        className={styles.editForm}
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            handleSave()
                                        }}
                                    >
                                        <div className={styles.field}>
                                            <label className={styles.label}>Название</label>
                                            <input
                                                className={styles.input}
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Название формы"
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Описание</label>
                                            <input
                                                className={styles.input}
                                                type="text"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Описание"
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Статус</label>
                                            <select
                                                className={styles.select}
                                                value={is_published ? "true" : "false"}
                                                onChange={(e) =>
                                                    setIs_published(e.target.value === "true")
                                                }
                                            >
                                                <option value="false">Черновик</option>
                                                <option value="true">Опубликовано</option>
                                            </select>
                                        </div>
                                        <div className={styles.editActions}>
                                            <button type="submit" className={styles.buttonPrimary}>
                                                Сохранить
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.buttonSecondary}
                                                onClick={() => dispatch(setSelectedForm(undefined))}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className={styles.actions}>
                                        <Link
                                            className={styles.actionBtn}
                                            to={`/forms/edit/${f.id}`}
                                        >
                                            Открыть
                                        </Link>
                                        <Link
                                            className={styles.actionBtn}
                                            to={`/forms/${f.id}/responses`}
                                        >
                                            Ответы
                                        </Link>
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={() => dispatch(setSelectedForm(f))}
                                        >
                                            Настройки
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={() => handleCopyLink(f)}
                                        >
                                            Ссылка
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                            onClick={() => handleDelete(f.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {message && <p className={styles.message}>{message}</p>}

            {copyToast && (
                <div className={styles.copyToast} role="status">
                    Ссылка скопирована в буфер обмена
                </div>
            )}
        </>
    )
}
