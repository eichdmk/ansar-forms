import React, { useState } from "react"
import { formsAPI } from "../../api"
import { useDispatch } from "react-redux"
import { addForm, updateForm } from "../../store/slices/formSlices"
import type { AxiosError } from "axios"
import { useAppSelector } from "../../hooks/useAppSelector"
import styles from "./CreateForm.module.css"

type CreateFormProps = {
    onCreated?: (formId: string) => void
}

export function CreateForm({ onCreated }: CreateFormProps = {}) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [is_published, setIs_published] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const dispatch = useDispatch()
    const selectedForm = useAppSelector(state => state.forms.selectedForm)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        setLoading(true)

        if (selectedForm) {
            try {
                const result = await formsAPI.update(selectedForm.id, { title, description, is_published })
                dispatch(updateForm(result))

            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (!err.response) {
                    return
                }
                setMessage(err.response.data.error ?? 'Произошла ошибка')
                console.error(err.response.data.error ?? 'Произошла ошибка')
            }
        } else {
            try {
                const result = await formsAPI.create({ title, description, is_published })
                dispatch(addForm(result))
                onCreated?.(result.id)
            } catch (error) {
                const err = error as AxiosError<{ error?: string }>
                if (!err.response) {
                    return
                }
                setMessage(err.response.data.error ?? 'Произошла ошибка')
                console.error(err.response.data.error ?? 'Произошла ошибка')
            }
        }

        setLoading(false)
        setTitle('')
        setDescription('')
        setIs_published(false)
    }


    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Новая форма</h2>
            <p className={styles.subtitle}>Создайте форму и добавьте в неё вопросы</p>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="create-form-title">Название формы</label>
                    <input
                        id="create-form-title"
                        className={styles.input}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Например: Опрос удовлетворённости"
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label className={`${styles.label} ${styles.labelOptional}`} htmlFor="create-form-desc">Описание (необязательно)</label>
                    <input
                        id="create-form-desc"
                        className={styles.input}
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Краткое описание формы"
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="create-form-status">Статус</label>
                    <select
                        id="create-form-status"
                        className={styles.select}
                        value={is_published ? "true" : "false"}
                        onChange={(e) => setIs_published(e.target.value === "true")}
                    >
                        <option value="false">Черновик</option>
                        <option value="true">Опубликовать</option>
                    </select>
                </div>
                <button className={styles.button} disabled={loading} type="submit">
                    {loading ? "Создание…" : "Создать форму"}
                </button>
            </form>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    )
}