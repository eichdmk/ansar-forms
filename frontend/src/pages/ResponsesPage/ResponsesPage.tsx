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

export function ResponsesPage() {
  const { id } = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<ResponseWithAnswers[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      if (!id) return
      setMessage("")
      try {
        const [formRes, questionsRes, responsesRes] = await Promise.all([
          formsAPI.getById(id),
          questionsApi.getByFormId(id),
          responsesAPI.getByFormId(id),
        ])
        setForm(formRes)
        setQuestions(questionsRes)
        setResponses(responsesRes)
      } catch (error) {
        const err = error as AxiosError<{ error?: string }>
        if (err.response) {
          setMessage(err.response.data?.error ?? "Произошла ошибка")
        }
      }
    }
    load()
  }, [id])

  const questionMap = new Map(questions.map((q) => [q.id, q]))

  const total = responses.length
  const [currentPage, setCurrentPage] = useState(0)
  const currentResponse = total > 0 ? responses[currentPage] : null
  const hasPrev = currentPage > 0
  const hasNext = currentPage < total - 1

  return (
    <div className={styles.wrap}>
      <Link className={styles.backLink} to={`/forms/edit/${id}`}>
        ← К редактированию формы
      </Link>
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

      {total === 0 && !message && form && (
        <p className={styles.empty}>Пока нет ответов на форму.</p>
      )}

      {currentResponse && (
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
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            >
              ← Назад
            </button>
            <span className={styles.paginationInfo}>
              Ответ {currentPage + 1} из {total}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              disabled={!hasNext}
              onClick={() => setCurrentPage((p) => Math.min(total - 1, p + 1))}
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
