import { useEffect, useState, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useLocalStorage } from "../../hooks/useLocalStorage"
import { formAccessAPI } from "../../api"
import type { AxiosError } from "axios"
import styles from "./JoinPage.module.css"

export function JoinPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [authToken] = useLocalStorage("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [alreadyHadAccess, setAlreadyHadAccess] = useState(false)
  const navigate = useNavigate()
  const acceptedRef = useRef(false)

  useEffect(() => {
    if (!token || token.trim() === "") {
      navigate("/forms", { replace: true })
      return
    }
    if (!authToken) {
      const returnUrl = `/join?token=${encodeURIComponent(token)}`
      navigate(`/?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true })
      return
    }
    if (acceptedRef.current) return
    acceptedRef.current = true
    formAccessAPI
      .acceptInvite(token)
      .then((data) => {
        setStatus("success")
        setAlreadyHadAccess(Boolean(data.already_had_access))
        setTimeout(() => navigate("/forms", { replace: true }), 1500)
      })
      .catch((err: AxiosError<{ error?: string }>) => {
        setStatus("error")
        acceptedRef.current = false
        setErrorMessage(err.response?.data?.error ?? "Не удалось принять приглашение")
      })
  }, [token, authToken, navigate])

  if (!token || !authToken) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === "loading" && (
          <p className={styles.text}>Принятие приглашения…</p>
        )}
        {status === "success" && (
          <p className={styles.textSuccess}>
            {alreadyHadAccess
              ? "У вас уже есть доступ к этой форме. Перенаправление…"
              : "Доступ к форме получен. Перенаправление…"}
          </p>
        )}
        {status === "error" && (
          <>
            <p className={styles.textError}>{errorMessage}</p>
            <button
              type="button"
              className={styles.button}
              onClick={() => navigate("/forms")}
            >
              К списку форм
            </button>
          </>
        )}
      </div>
    </div>
  )
}
