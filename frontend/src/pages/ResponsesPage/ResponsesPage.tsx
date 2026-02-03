import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { formsAPI, questionsApi, responsesAPI } from "../../api"
import type { Form, Question, ResponseWithAnswers } from "../../types"
import type { AxiosError } from "axios"
import styles from "./ResponsesPage.module.css"

function formatDate(s: string) {
  try {
    const d = new Date(s)
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return s
  }
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—"
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

const PAGE_SIZE = 1

export function ResponsesPage() {
  const { id } = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentResponse, setCurrentResponse] = useState<ResponseWithAnswers | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!id) return
    setMessage("")
    Promise.all([formsAPI.getById(id), questionsApi.getByFormId(id)])
      .then(([formRes, questionsRes]) => {
        setForm(formRes)
        setQuestions(questionsRes)
      })
      .catch((error: AxiosError<{ error?: string }>) => {
        if (error.response) {
          setMessage(error.response.data?.error ?? "Произошла ошибка")
        }
      })
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    responsesAPI
      .getByFormId(id, currentPage, PAGE_SIZE)
      .then((res) => {
        setTotal(res.total)
        setCurrentResponse(res.items[0] ?? null)
      })
      .catch((error: AxiosError<{ error?: string }>) => {
        if (error.response) {
          setMessage(error.response.data?.error ?? "Произошла ошибка")
        }
        setCurrentResponse(null)
      })
      .finally(() => setLoading(false))
  }, [id, currentPage])

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className={styles.wrap}>
      {form && (
        <>
          <h1 className={styles.title}>{form.title}</h1>
          {form.description && (
            <p className={styles.description}>{form.description}</p>
          )}
        </>
      )}
      <p className={styles.count}>
        Ответов: {total}
      </p>

      {total === 0 && !message && !loading && form && (
        <p className={styles.empty}>Пока нет ответов на форму.</p>
      )}

      {loading && (
        <p className={styles.loading}>Загрузка…</p>
      )}

      {!loading && currentResponse && (
        <>
          <article className={styles.responseCard}>
            <p className={styles.responseDate}>
              {formatDate(currentResponse.created_at)}
            </p>
            {currentResponse.answers.map((a) => {
              const q = questionMap.get(a.question_id)
              const label = q ? q.label : a.question_id
              return (
                <div key={a.question_id} className={styles.answerRow}>
                  <p className={styles.answerLabel}>{label}</p>
                  <p className={styles.answerValue}>{formatValue(a.value)}</p>
                </div>
              )
            })}
          </article>

          <nav className={styles.pagination} aria-label="Навигация по ответам">
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={!hasPrev}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Назад
            </button>
            <span className={styles.paginationInfo}>
              Ответ {currentPage} из {totalPages}
              {total > 0 && ` (всего ${total})`}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={!hasNext}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Вперёд →
            </button>
          </nav>
        </>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}
