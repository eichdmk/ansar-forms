import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
import { formsAPI, questionsApi, responsesAPI } from "../../api"
import { setCurrentForm } from "../../store/slices/currentFormSlice"
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
  if (value === undefined || value === null) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}

const PAGE_SIZE = 50

export function ResponsesPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const formFromRedux = useAppSelector((state) =>
    state.currentForm.formId === id ? state.currentForm.form : null
  )
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<ResponseWithAnswers[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [expandedResponses ] = useState<Set<string>>(new Set())
  const [filterDate, setFilterDate] = useState<string>("")

  useEffect(() => {
    if (!id) return
    setMessage("")
    if (formFromRedux?.id === id) {
      setForm(formFromRedux)
      questionsApi.getByFormId(id).then((questionsRes) => {
        const sortedQuestions = [...questionsRes].sort((a, b) =>
          (a.order || 0) - (b.order || 0) ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        setQuestions(sortedQuestions)
      }).catch(() => {})
      return
    }
    Promise.all([formsAPI.getByIdWithRole(id), questionsApi.getByFormId(id)])
      .then(([formRes, questionsRes]) => {
        setForm(formRes)
        dispatch(setCurrentForm({ formId: id, form: formRes }))
        const sortedQuestions = [...questionsRes].sort((a, b) =>
          (a.order || 0) - (b.order || 0) ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        setQuestions(sortedQuestions)
      })
      .catch((error: AxiosError<{ error?: string }>) => {
        if (error.response) {
          setMessage(error.response.data?.error ?? "Произошла ошибка")
        }
      })
  }, [id, formFromRedux, dispatch])

  useEffect(() => {
    if (!id) return
    // При изменении фильтра сбрасываем страницу на 1
    if (filterDate) {
      setCurrentPage(1)
    }
  }, [id, filterDate])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    responsesAPI
      .getByFormId(id, currentPage, PAGE_SIZE, filterDate || undefined)
      .then((res) => {
        setTotal(res.total)
        setResponses(res.items)
      })
      .catch((error: AxiosError<{ error?: string }>) => {
        if (error.response) {
          setMessage(error.response.data?.error ?? "Произошла ошибка")
        }
        setResponses([])
      })
      .finally(() => setLoading(false))
  }, [id, currentPage, filterDate])

  const getAnswerValue = (response: ResponseWithAnswers, questionId: string) => {
    const answer = response.answers.find(a => a.question_id === questionId)
    return answer ? formatValue(answer.value) : ""
  }

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
      
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.count}>
            Ответов: {total}
            {total > 0 && ` (показано ${responses.length})`}
          </p>
          <div className={styles.dateFilter}>
            <label htmlFor="filterDate" className={styles.dateFilterLabel}>
              С даты:
            </label>
            <input
              id="filterDate"
              type="date"
              className={styles.dateFilterInput}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              aria-label="Фильтр по дате"
            />
            {filterDate && (
              <button
                type="button"
                className={styles.dateFilterClear}
                onClick={() => setFilterDate("")}
                title="Сбросить фильтр"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <Link to={`/forms/${id}/fill`} className={styles.viewFormLink}>
          Открыть форму
        </Link>
      </div>

      {total === 0 && !message && !loading && form && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Пока нет ответов на форму.</p>
          <Link to={`/forms/${id}/fill`} className={styles.emptyLink}>
            Открыть форму для заполнения
          </Link>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка ответов...</p>
        </div>
      )}

      {!loading && responses.length > 0 && (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.responsesTable}>
              <thead>
                <tr>
                  <th className={`${styles.tableHeader} ${styles.rowNumber}`}>#</th>
                  <th className={`${styles.tableHeader} ${styles.timestamp}`}>
                    Отправлено
                    <span className={styles.sortIndicator}>▼</span>
                  </th>
                  {questions.map((question, index) => (
                    <th 
                      key={question.id} 
                      className={styles.tableHeader}
                      title={question.label}
                    >
                      <span className={styles.questionNumber}>Q{index + 1}</span>
                      <span className={styles.questionLabel}>
                        {question.label.length > 30 
                          ? `${question.label.substring(0, 30)}...` 
                          : question.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response, rowIndex) => {
                  const isExpanded = expandedResponses.has(response.id)
                  return (
                    <>
                      <tr 
                        key={response.id} 
                        className={`${styles.tableRow} ${isExpanded ? styles.expanded : ''}`}
                      >
                        <td className={`${styles.tableCell} ${styles.rowNumber}`}>
                          {(currentPage - 1) * PAGE_SIZE + rowIndex + 1}
                        </td>
                        <td className={`${styles.tableCell} ${styles.timestamp}`}>
                          {formatDate(response.created_at)}
                        </td>
                        {questions.map((question) => (
                          <td 
                            key={`${response.id}-${question.id}`} 
                            className={styles.tableCell}
                            title={getAnswerValue(response, question.id)}
                          >
                            <div className={styles.cellContent}>
                              {getAnswerValue(response, question.id)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      
                      {isExpanded && (
                        <tr className={styles.detailRow}>
                          <td colSpan={questions.length + 3} className={styles.detailCell}>
                            <div className={styles.responseDetail}>
                              <h3 className={styles.detailTitle}>
                                Ответ от {formatDate(response.created_at)}
                              </h3>
                              <div className={styles.detailGrid}>
                                {questions.map((question) => {
                                  const value = getAnswerValue(response, question.id)
                                  return (
                                    <div key={question.id} className={styles.detailItem}>
                                      <div className={styles.detailLabel}>{question.label}</div>
                                      <div className={styles.detailValue}>
                                        {value || <span className={styles.emptyAnswer}>—</span>}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Навигация по страницам">
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={!hasPrev}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Предыдущая
              </button>
              
              <div className={styles.paginationPages}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`${styles.pageBtn} ${
                        currentPage === pageNum ? styles.activePage : ''
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                type="button"
                className={styles.paginationBtn}
                disabled={!hasNext}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Следующая →
              </button>
              
              <div className={styles.pageInfo}>
                Страница {currentPage} из {totalPages}
              </div>
            </nav>
          )}
        </>
      )}

      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}