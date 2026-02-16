import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import type { Editor } from "@tiptap/core"
import { authAPI } from "../../api"
import type { AxiosError } from "axios"
import styles from "./AccountTermsPage.module.css"

const HEADING_OPTIONS = [
  { value: "", label: "Обычный текст" },
  { value: "1", label: "Заголовок 1" },
  { value: "2", label: "Заголовок 2" },
  { value: "3", label: "Заголовок 3" },
] as const

function TermsToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  const currentLevel =
    editor.isActive("heading", { level: 1 })
      ? "1"
      : editor.isActive("heading", { level: 2 })
        ? "2"
        : editor.isActive("heading", { level: 3 })
          ? "3"
          : ""

  function handleHeadingChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!editor) return
    const value = e.target.value
    if (value === "") {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run()
    }
  }

  return (
    <div className={styles.termsToolbar}>
      <select
        className={styles.toolbarSelect}
        value={currentLevel}
        onChange={handleHeadingChange}
        title="Стиль абзаца"
        aria-label="Стиль абзаца"
      >
        {HEADING_OPTIONS.map(({ value, label }) => (
          <option key={value || "p"} value={value}>
            {label}
          </option>
        ))}
      </select>
      <span className={styles.toolbarDivider} aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? styles.toolbarBtnActive : styles.toolbarBtn}
        title="Жирный"
      >
        <strong>Ж</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? styles.toolbarBtnActive : styles.toolbarBtn}
        title="Курсив"
      >
        <em>К</em>
      </button>
      <span className={styles.toolbarDivider} aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? styles.toolbarBtnActive : styles.toolbarBtn}
        title="Маркированный список"
      >
        • Список
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? styles.toolbarBtnActive : styles.toolbarBtn}
        title="Нумерованный список"
      >
        1. Список
      </button>
    </div>
  )
}

export function AccountTermsPage() {
  const [termsText, setTermsText] = useState("")
  const [termsLoading, setTermsLoading] = useState(true)
  const [termsSaving, setTermsSaving] = useState(false)
  const [termsMessage, setTermsMessage] = useState("")
  const prevTermsLoading = useRef<boolean | null>(null)
  const [, setToolbarUpdate] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Опишите условия обработки данных…" }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: styles.termsEditorContent,
      },
    },
  })

  useEffect(() => {
    setTermsLoading(true)
    authAPI
      .getMe()
      .then((me) => setTermsText(me.terms_text ?? ""))
      .catch(() => setTermsMessage("Не удалось загрузить условия"))
      .finally(() => setTermsLoading(false))
  }, [])

  useEffect(() => {
    if (!editor) return
    const onUpdate = () => setToolbarUpdate((n) => n + 1)
    editor.on("selectionUpdate", onUpdate)
    editor.on("transaction", onUpdate)
    return () => {
      editor.off("selectionUpdate", onUpdate)
      editor.off("transaction", onUpdate)
    }
  }, [editor])

  useEffect(() => {
    const justFinishedLoading = prevTermsLoading.current === true && termsLoading === false
    if (editor && justFinishedLoading) {
      editor.commands.setContent(termsText ?? "")
    }
    prevTermsLoading.current = termsLoading
  }, [termsLoading, editor, termsText])

  async function handleSaveTerms(e: React.FormEvent) {
    e.preventDefault()
    if (!editor) return
    setTermsSaving(true)
    setTermsMessage("")
    try {
      const html = editor.getHTML()
      await authAPI.updateTerms(html)
      setTermsMessage("Условия сохранены")
      setTimeout(() => setTermsMessage(""), 3000)
    } catch (err) {
      const ax = err as AxiosError<{ error?: string }>
      setTermsMessage(ax.response?.data?.error ?? "Не удалось сохранить")
    } finally {
      setTermsSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>Условия использования</h1>
        <p className={styles.intro}>
          Применяются ко всем вашим формам. Отображаются респондентам при заполнении; по ним можно перейти по ссылке. Без заполненных условий форму нельзя опубликовать.
        </p>

        {termsLoading ? (
          <p className={styles.loading}>Загрузка…</p>
        ) : (
          <form onSubmit={handleSaveTerms}>
            <div className={styles.termsEditorWrap}>
              <TermsToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
            {termsMessage && (
              <p className={termsMessage === "Условия сохранены" ? styles.termsSuccess : styles.message}>
                {termsMessage}
              </p>
            )}
            <button
              type="submit"
              className={styles.termsSaveBtn}
              disabled={termsSaving}
            >
              {termsSaving ? "Сохранение…" : "Сохранить условия"}
            </button>
          </form>
        )}

        <p className={styles.backWrap}>
          <Link to="/forms" className={styles.backLink}>
            ← К списку форм
          </Link>
        </p>
      </div>
    </div>
  )
}
