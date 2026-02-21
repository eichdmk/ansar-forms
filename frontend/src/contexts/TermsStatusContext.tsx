import { createContext, useContext, useState, useCallback } from "react"

export type TermsStatus = "Сохранено" | "Сохраняется…" | "Несохранено" | null

type TermsStatusContextValue = {
  termsStatus: TermsStatus
  setTermsStatus: (status: TermsStatus) => void
}

const TermsStatusContext = createContext<TermsStatusContextValue | null>(null)

export function TermsStatusProvider({ children }: { children: React.ReactNode }) {
  const [termsStatus, setTermsStatus] = useState<TermsStatus>(null)
  return (
    <TermsStatusContext.Provider value={{ termsStatus, setTermsStatus }}>
      {children}
    </TermsStatusContext.Provider>
  )
}

export function useTermsStatus() {
  const ctx = useContext(TermsStatusContext)
  return ctx
}
