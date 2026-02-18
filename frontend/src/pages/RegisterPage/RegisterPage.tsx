import { useState, useEffect } from "react"
import { authAPI } from "../../api"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import type { AxiosError } from "axios"
import { Link, useNavigate } from "react-router-dom"
import styles from "./RegisterPage.module.css"

export function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [token, setValue] = useLocalStorage("token")
    const navigate = useNavigate()

    useEffect(() => {
        const valid = typeof token === 'string' && token.trim().length > 0
        if (valid) {
            navigate("/forms", { replace: true })
        }
    }, [token, navigate])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        if (password !== passwordConfirm) {
            setError("Пароли не совпадают")
            return
        }

        if (password.length < 6) {
            setError("Пароль должен быть не менее 6 символов")
            return
        }

        setLoading(true)
        try {
            await authAPI.register({ email, password })
            const loginToken = await authAPI.login({ email, password })
            setValue(loginToken)
            navigate("/forms", { replace: true })
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

          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Создайте аккаунт, чтобы создавать формы и собирать ответы</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <label className={styles.label} htmlFor="reg-email">
                Логин (email)
              </label>
              <input
                id="reg-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="reg-password">
                Пароль
              </label>
              <input
                id="reg-password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="reg-password-confirm">
                Повторите пароль
              </label>
              <input
                id="reg-password-confirm"
                className={styles.input}
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Введите пароль ещё раз"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>
            <button className={styles.button} disabled={loading} type="submit">
              {loading ? "Регистрация…" : "Зарегистрироваться"}
            </button>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>

          <p className={styles.footer}>
            Уже есть аккаунт?{" "}
            <Link to="/login" className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
