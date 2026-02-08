import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useParams, useNavigate } from "react-router-dom"
import { formsAPI, formAccessAPI } from "../../api"
import type { Form } from "../../types"
import type { FormAccessWithUser } from "../../types/formAccess"
import type { AxiosError } from "axios"
import styles from "./FormSettingsPage.module.css"

export function FormSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<Form | null>(null)
  const [message, setMessage] = useState("")
  const [accessList, setAccessList] = useState<FormAccessWithUser[] | null>(null)
  const [accessLoading, setAccessLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteCreating, setInviteCreating] = useState(false)
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor")
  const [inviteExpiresHours, setInviteExpiresHours] = useState("")

  useEffect(() => {
    if (!id) return
    formsAPI
      .getByIdWithRole(id)
      .then((f) => {
        setForm(f)
        if (f.role !== "owner") {
          navigate(`/forms/edit/${id}`, { replace: true })
        }
      })
      .catch(() => {
        setMessage("Нет доступа к форме")
      })
  }, [id, navigate])

  const canManageAccess = form?.role === "owner"

  useEffect(() => {
    if (!id || !canManageAccess) return
    setAccessLoading(true)
    formAccessAPI
      .getAccessList(id)
      .then(setAccessList)
      .catch(() => setAccessList([]))
      .finally(() => setAccessLoading(false))
  }, [id, canManageAccess])

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setInviteCreating(true)
    setInviteLink(null)
    try {
      const expiresInHours = inviteExpiresHours.trim()
        ? parseInt(inviteExpiresHours, 10)
        : undefined
      const result = await formAccessAPI.createInvite(id, {
        role: inviteRole,
        expiresInHours:
          expiresInHours && !Number.isNaN(expiresInHours) ? expiresInHours : undefined,
      })
      setInviteLink(result.link)
    } catch (err) {
      const ax = err as AxiosError<{ error?: string }>
      setMessage(ax.response?.data?.error ?? "Не удалось создать приглашение")
    } finally {
      setInviteCreating(false)
    }
  }

  function closeInviteModal() {
    setShowInviteModal(false)
    setInviteLink(null)
    setInviteExpiresHours("")
  }

  async function handleRemoveAccess(userId: string) {
    if (!id || !window.confirm("Убрать доступ этого пользователя?")) return
    try {
      await formAccessAPI.removeAccess(id, userId)
      setAccessList((prev) => (prev ? prev.filter((a) => a.user_id !== userId) : []))
    } catch (err) {
      const ax = err as AxiosError<{ error?: string }>
      setMessage(ax.response?.data?.error ?? "Не удалось убрать доступ")
    }
  }

  if (!form || form.role !== "owner") {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          {message && <p className={styles.message}>{message}</p>}
          {!message && <p className={styles.loading}>Загрузка…</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>Настройки формы</h1>
        <div className={styles.accessCard}>
          <h2 className={styles.accessTitle}>Доступ к форме</h2>
          <p className={styles.accessIntro}>
            Выдайте доступ по ссылке или удалите доступ у пользователей ниже.
          </p>
          {accessLoading ? (
            <p className={styles.accessLoading}>Загрузка…</p>
          ) : (
            <>
              <ul className={styles.accessList}>
                {accessList?.map((a) => (
                  <li key={a.id} className={styles.accessRow}>
                    <span className={styles.accessEmail}>{a.email}</span>
                    <span className={styles.accessRole}>
                      {a.role === "editor" ? "Редактор" : "Только просмотр"}
                    </span>
                    {form?.role === "owner" && (
                      <button
                        type="button"
                        className={styles.accessRemoveBtn}
                        onClick={() => handleRemoveAccess(a.user_id)}
                      >
                        Удалить
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {accessList?.length === 0 && (
                <p className={styles.accessEmpty}>Никому ещё не выдан доступ</p>
              )}
              <button
                type="button"
                className={styles.inviteBtn}
                onClick={() => setShowInviteModal(true)}
              >
                Пригласить по ссылке
              </button>
            </>
          )}
        </div>

        {message && <p className={styles.message}>{message}</p>}
      </div>

      {showInviteModal &&
        createPortal(
          <div className={styles.modalOverlay} onClick={closeInviteModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>
                {inviteLink ? "Ссылка приглашения" : "Пригласить по ссылке"}
              </h3>
              {inviteLink ? (
                <>
                  <p className={styles.modalHint}>
                    Отправьте эту ссылку. По ней можно принять приглашение один раз.
                  </p>
                  <div className={styles.inviteLinkRow}>
                    <input
                      type="text"
                      readOnly
                      className={styles.inviteLinkInput}
                      value={inviteLink}
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink)
                        setMessage("Ссылка скопирована")
                        setTimeout(() => setMessage(""), 2000)
                      }}
                    >
                      Копировать
                    </button>
                  </div>
                  <button
                    type="button"
                    className={styles.modalCloseBtn}
                    onClick={closeInviteModal}
                  >
                    Готово
                  </button>
                </>
              ) : (
                <form onSubmit={handleCreateInvite}>
                  <label className={styles.modalLabel}>
                    Роль
                    <select
                      className={styles.modalSelect}
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as "editor" | "viewer")
                      }
                    >
                      <option value="editor">Редактор</option>
                      <option value="viewer">Только просмотр</option>
                    </select>
                  </label>
                  <label className={styles.modalLabel}>
                    Срок действия (часов, необязательно)
                    <input
                      type="number"
                      min="1"
                      className={styles.modalInput}
                      value={inviteExpiresHours}
                      onChange={(e) => setInviteExpiresHours(e.target.value)}
                      placeholder="Без ограничения"
                    />
                  </label>
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.buttonSecondary}
                      onClick={closeInviteModal}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className={styles.buttonPrimary}
                      disabled={inviteCreating}
                    >
                      {inviteCreating ? "Создание…" : "Создать ссылку"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
