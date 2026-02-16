import { useDispatch } from "react-redux"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { formsAPI } from "../../api"
import { addForm, deleteForm, setForms } from "../../store/slices/formSlices"
import { useFormsSearch } from "../../contexts/FormsSearchContext"
import type { AxiosError } from "axios"
import type { Form } from "../../types"
import { Link } from "react-router-dom"
import styles from "./FormPage.module.css"

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

export function FormsPage() {
  const forms = useAppSelector(state => state.forms.forms)
  const { searchQuery } = useFormsSearch()
  const [message, setMessage] = useState("")
  const [creating, setCreating] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const filteredForms = searchQuery.trim()
    ? forms.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : forms

  useEffect(() => {
    async function getForms() {
      const result = await formsAPI.getAll()
      dispatch(setForms(result))
    }
    getForms()
  }, [dispatch])

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить эту форму? Это действие нельзя отменить.")) return
    try {
      await formsAPI.delete(id)
      dispatch(deleteForm({ id }))
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>
      if (err.response) {
        setMessage(err.response.data.error || "Произошла ошибка")
      }
    }
  }

  async function handleCreateBlank() {
    setCreating(true)
    setMessage("")
    try {
      const result = await formsAPI.create({
        title: "Новая форма",
        description: undefined,
        is_published: false,
      })
      dispatch(addForm(result))
      navigate(`/forms/edit/${result.id}`)
    } catch (error) {
      const err = error as AxiosError<{ error?: string }>
      if (err.response) {
        setMessage(err.response.data?.error ?? "Не удалось создать форму")
      }
      setCreating(false)
    }
  }

  return (
    <>
      <section className={styles.createSection}>
        <button
          type="button"
          className={styles.blankFormCard}
          onClick={handleCreateBlank}
          disabled={creating}
          aria-label="Создать пустую форму"
        >
          <span className={styles.blankFormIcon}>+</span>
          <span className={styles.blankFormLabel}>
            {creating ? "Создание…" : "Пустая форма"}
          </span>
        </button>
      </section>

      <section className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.sectionTitle}>Недавние формы</h2>
        </div>

        {filteredForms.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>
              {searchQuery.trim() ? "Ничего не найдено" : "Пока нет форм"}
            </p>
            <p className={styles.emptyText}>
              {searchQuery.trim()
                ? "Попробуйте изменить запрос поиска."
                : "Создайте первую форму с помощью карточки «Пустая форма» выше."}
            </p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {filteredForms.map((f: Form) => (
              <li key={f.id} className={styles.card}>
                <Link to={`/forms/edit/${f.id}`} className={styles.cardPreview} aria-hidden>
                  <span className={styles.cardPreviewPlaceholder} />
                </Link>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>
                    <Link className={styles.cardTitleLink} to={`/forms/edit/${f.id}`}>
                      {f.title}
                    </Link>
                  </h3>
                  <div className={styles.cardMetaRow}>
                    {f.updated_at && (
                      <span className={styles.cardMeta}>{formatDate(f.updated_at)}</span>
                    )}
                    <span
                      className={
                        f.is_published ? styles.badgePublished : styles.badgeDraft
                      }
                    >
                      {f.is_published ? "Опубликовано" : "Черновик"}
                    </span>
                    {f.role && f.role !== 'owner' && (
                      <span className={styles.badgeRole}>
                        {f.role === 'editor' ? 'Редактор' : 'Просмотр'}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.actions}>
                  <Link className={styles.actionBtn} to={`/forms/edit/${f.id}`}>
                    Открыть
                  </Link>
                  <Link className={styles.actionBtn} to={`/forms/${f.id}/responses`}>
                    Ответы
                  </Link>
                  {(f.role === 'owner' || f.role === 'editor') && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(f.id)
                      }}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </section>
    </>
  )
}
