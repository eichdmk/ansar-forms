import { useState, useEffect } from "react"
import { authAPI } from "../../api"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import type { AxiosError } from "axios"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import styles from "./LoginPage.module.css"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [token, setValue] = useLocalStorage("token")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")

  useEffect(() => {
    const valid = typeof token === "string" && token.trim().length > 0
    if (valid) {
      navigate(returnUrl ? decodeURIComponent(returnUrl) : "/forms", { replace: true })
    }
  }, [token, navigate, returnUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await authAPI.login({ email, password })
      setValue(result)
      navigate(returnUrl ? decodeURIComponent(returnUrl) : "/forms", { replace: true })
    } catch (err) {
      const errRes = err as AxiosError<{ error?: string }>
      if (errRes.response) {
        setError(errRes.response.data?.error ?? "Произошла ошибка")
      } else {
        setError("Произошла ошибка")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardLeft}>
          <div className={styles.brand}>
            <img className={styles.brandLogo} src="/logo.png" alt="Ansar Forms" />
            <div className={styles.brandText}>
              <div className={styles.brandName}>Ansar Forms</div>
              <div className={styles.brandTagline}>Конструктор форм</div>
            </div>
          </div>

          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Войдите в аккаунт, чтобы управлять формами</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <label className={styles.label} htmlFor="login-email">
                Логин
              </label>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите логин"
                autoComplete="email"
              />
            </div>

            <div>
              <label className={styles.label} htmlFor="login-password">
                Пароль
              </label>
              <input
                id="login-password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
              />
            </div>

            <label className={styles.checkboxWrap}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className={styles.checkboxLabel}>Запомнить на этом устройстве</span>
            </label>

            <button className={styles.button} disabled={loading} type="submit">
              {loading ? "Вход…" : "Войти"}
            </button>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>

          <p className={styles.footer}>
            Нет аккаунта?{" "}
            <Link to="/register" className={styles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}