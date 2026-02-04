import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout/Layout"
import { DetailFormPage } from "./pages/DetailFormPage/DetailFormPage"
import { FillFormPage } from "./pages/FillFormPage/FillFormPage"
import { FormsPage } from "./pages/FormPage/FormPage"
import { LoginPage } from "./pages/LoginPage/LoginPage"
import { ResponsesPage } from "./pages/ResponsesPage/ResponsesPage"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useLocalStorage } from "./hooks/useLocalStorage"

function HomePage() {
  const [token] = useLocalStorage("token")
  
  if (token) {
    return <Navigate to="/forms" replace />
  }
  
  return <LoginPage />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/forms/:id/fill" element={<FillFormPage />} />

        <Route element={<Layout />}>
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <FormsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/edit/:id"
            element={
              <ProtectedRoute>
                <DetailFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/:id/responses"
            element={
              <ProtectedRoute>
                <ResponsesPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
