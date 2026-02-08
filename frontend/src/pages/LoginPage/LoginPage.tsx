import { useState } from "react"
import { authAPI } from "../../api"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import type { AxiosError } from "axios"
import { useNavigate, useSearchParams } from "react-router-dom"
import styles from "./LoginPage.module.css"

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [, setValue] = useLocalStorage("token")
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const returnUrl = searchParams.get("returnUrl")

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
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
                <h1 className={styles.title}>Вход</h1>
                <p className={styles.subtitle}>Войдите в аккаунт, чтобы управлять формами</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                />
                <button className={styles.button} disabled={loading} type="submit">
                    Войти
                </button>
                {error && <p className={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    )
}