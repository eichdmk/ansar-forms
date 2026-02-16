import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../../hooks/useAppSelector"
import { FormsSearchProvider, useFormsSearch } from "../../contexts/FormsSearchContext"
import { formsAPI } from "../../api"
import { setCurrentForm, clearCurrentForm } from "../../store/slices/currentFormSlice"
import type { AxiosError } from "axios"
import styles from "./Layout.module.css"

function LayoutHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch()
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
  const [statusToast, setStatusToast] = useState<string | null>(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const form = useAppSelector((state) =>
    state.currentForm.formId === formId ? state.currentForm.form : null
  )

  useEffect(() => {
    if (!formId || !isFormContext) {
      dispatch(clearCurrentForm())
      return
    }
    let cancelled = false
    formsAPI.getByIdWithRole(formId).then((f) => {
      if (!cancelled) dispatch(setCurrentForm({ formId, form: f }))
    }).catch(() => {
      if (!cancelled) dispatch(clearCurrentForm())
    })
    return () => { cancelled = true }
  }, [formId, isFormContext, dispatch])

  useEffect(() => {
    if (!isFormContext) {
      setMobileMenuOpen(false)
    }
  }, [location.pathname, isFormContext])

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

  async function handlePublishToggle() {
    if (!formId || !form || publishLoading) return
    const canChange = form.role === "owner" || form.role === "editor"
    if (!canChange) return
    const nextPublished = !form.is_published
    setPublishLoading(true)
    setStatusToast(null)
    try {
      const updated = await formsAPI.updateStatus(formId, nextPublished)
      dispatch(setCurrentForm({ formId, form: { ...updated, role: updated.role ?? form.role } }))
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>
      const message = e.response?.data?.error ?? "Не удалось изменить статус"
      setStatusToast(message)
      setTimeout(() => setStatusToast(null), 4000)
    } finally {
      setPublishLoading(false)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Link to="/forms" className={styles.brandLink}>
          <img src="/logo.png" alt="Ansar Forms" className={styles.logo} />
          <span className={styles.brandText}>Ansar Forms</span>
        </Link>
      </div>
      <div className={styles.headerCenter}>
        {showSearch && (
          <>
            <div className={styles.searchWrap}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Поиск форм"
              />
            </div>
            <Link to="/forms/account/terms" className={styles.accountTermsLink}>
              Условия использования
            </Link>
          </>
        )}
        {isFormContext && (
          <>
            <button
              type="button"
              className={styles.burgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
              aria-expanded={mobileMenuOpen}
            >
              <span className={styles.burgerIcon}>
                <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLine1 : ''}`}></span>
                <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLine2 : ''}`}></span>
                <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.burgerLine3 : ''}`}></span>
              </span>
            </button>
            <nav className={`${styles.formNav} ${mobileMenuOpen ? styles.formNavOpen : ''}`} aria-label="Разделы формы">
              <a
                className={styles.formNavLink}
                href={fillUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Просмотр
              </a>
              {(form?.role === "owner" || form?.role === "editor") && (
                <Link
                  className={isQuestions ? styles.formNavLinkActive : styles.formNavLink}
                  to={editUrl}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Вопросы
                </Link>
              )}
              <Link
                className={isResponses ? styles.formNavLinkActive : styles.formNavLink}
                to={responsesUrl}
                onClick={() => setMobileMenuOpen(false)}
              >
                Ответы
              </Link>
              {form?.role === "owner" && (
                <Link
                  className={isSettings ? styles.formNavLinkActive : styles.formNavLink}
                  to={settingsUrl}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Настройки
                </Link>
              )}
              {(form?.role === "owner" || form?.role === "editor") && (
                <label className={styles.publishToggleWrap} title={form.is_published ? "Форма открыта для ответов" : "Форма в черновике"}>
                  <span className={styles.publishToggleLabel}>Принимать ответы</span>
                  <input
                    type="checkbox"
                    className={styles.publishToggleInput}
                    checked={form.is_published}
                    disabled={publishLoading}
                    onChange={handlePublishToggle}
                    aria-label="Форма открыта для ответов"
                  />
                  <span className={styles.publishToggleSlider} aria-hidden />
                </label>
              )}
              <button
                type="button"
                className={styles.copyLinkBtn}
                onClick={() => {
                  handleCopyLink()
                  setMobileMenuOpen(false)
                }}
                title="Копировать ссылку на форму"
              >
                Ссылка
              </button>
              <div className={styles.mobileMenuDivider}></div>
              <button
                type="button"
                className={styles.mobileLogoutBtn}
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
              >
                Выйти
              </button>
            </nav>
          </>
        )}
      </div>
      <div className={styles.headerRight}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Выйти
        </button>
      </div>
      {copyToast && (
        <div className={styles.copyToast} role="status">
          Ссылка скопирована в буфер обмена
        </div>
      )}
      {statusToast && (
        <div className={styles.statusToast} role="alert">
          {statusToast}
        </div>
      )}
      {isFormContext && mobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)} />
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
