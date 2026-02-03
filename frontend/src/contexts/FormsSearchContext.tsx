import { createContext, useContext, useState, type ReactNode } from "react"

type FormsSearchContextValue = {
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const FormsSearchContext = createContext<FormsSearchContextValue | null>(null)

export function FormsSearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")
  return (
    <FormsSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </FormsSearchContext.Provider>
  )
}

export function useFormsSearch() {
  const ctx = useContext(FormsSearchContext)
  return ctx ?? { searchQuery: "", setSearchQuery: () => {} }
}
