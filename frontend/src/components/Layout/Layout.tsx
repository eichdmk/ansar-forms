import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation, useParams } from "react-router-dom"
import { FormsSearchProvider, useFormsSearch } from "../../contexts/FormsSearchContext"
import { formsAPI } from "../../api"
import type { Form } from "../../types"
import styles from "./Layout.module.css"

function LayoutHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { searchQuery, setSearchQuery } = useFormsSearch()
  const formId = params.id
  const showSearch = location.pathname === "/forms"
  const isFormContext =
    formId &&
    (location.pathname.startsWith("/forms/edit/") ||
      location.pathname.includes("/responses"))
  const isQuestions =
    location.pathname.startsWith("/forms/edit/") &&
    !location.pathname.endsWith("/settings")
  const isResponses = location.pathname.includes("/responses")
  const isSettings = location.pathname.endsWith("/settings")
  const fillUrl = formId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${formId}/fill`
    : ""
  const editUrl = formId ? `/forms/edit/${formId}` : ""
  const responsesUrl = formId ? `/forms/${formId}/responses` : ""
  const settingsUrl = formId ? `/forms/edit/${formId}/settings` : ""
  const [copyToast, setCopyToast] = useState(false)
  const [form, setForm] = useState<Form | null>(null)
  const [publishLoading, setPublishLoading] = useState(false)

  useEffect(() => {
    if (!formId || !isFormContext) {
      setForm(null)
      return
    }
    let cancelled = false
    formsAPI.getByIdWithRole(formId).then((f) => {
      if (!cancelled) setForm(f)
    }).catch(() => {
      if (!cancelled) setForm(null)
    })
    return () => { cancelled = true }
  }, [formId, isFormContext])

  function handleLogout() {
    localStorage.removeItem("token")
    navigate("/")
  }

  async function handleCopyLink() {
    if (!fillUrl) return
    try {
      await navigator.clipboard.writeText(fillUrl)
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2000)
    } catch {
      /* ignore */
    }
  }

  async function handleStatusChange(published: boolean) {
    if (!formId || !form) return
    setPublishLoading(true)
    try {
      const updated = await formsAPI.updateStatus(formId, published)
      setForm(updated)
    } catch {
      /* ignore */
    } finally {
      setPublishLoading(false)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Link to="/forms" className={styles.brandLink}>
          Ansar Forms
        </Link>
      </div>
      <div className={styles.headerCenter}>
        {showSearch && (
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Поиск форм"
          />
        )}
        {isFormContext && (
          <nav className={styles.formNav} aria-label="Разделы формы">
            <a
              className={styles.formNavLink}
              href={fillUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Просмотр
            </a>
            {(form?.role === "owner" || form?.role === "editor") && (
              <Link
                className={isQuestions ? styles.formNavLinkActive : styles.formNavLink}
                to={editUrl}
              >
                Вопросы
              </Link>
            )}
            <Link
              className={isResponses ? styles.formNavLinkActive : styles.formNavLink}
              to={responsesUrl}
            >
              Ответы
            </Link>
            {form?.role === "owner" && (
              <Link
                className={isSettings ? styles.formNavLinkActive : styles.formNavLink}
                to={settingsUrl}
              >
                Настройки
              </Link>
            )}
            <button
              type="button"
              className={styles.copyLinkBtn}
              onClick={handleCopyLink}
              title="Копировать ссылку на форму"
            >
              Ссылка
            </button>
          </nav>
        )}
      </div>
      <div className={styles.headerRight}>
        {isFormContext && form && (form.role === "owner" || form.role === "editor") && (
          <select
            className={styles.statusSelect}
            value={form.is_published ? "published" : "draft"}
            onChange={(e) => handleStatusChange(e.target.value === "published")}
            disabled={publishLoading}
            aria-label="Статус формы"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
          </select>
        )}
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </div>
      {copyToast && (
        <div className={styles.copyToast} role="status">
          Ссылка скопирована в буфер обмена
        </div>
      )}
    </header>
  )
}

export function Layout() {
  return (
    <FormsSearchProvider>
      <div className={styles.layout}>
        <LayoutHeader />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </FormsSearchProvider>
  )
}
