import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout/Layout"
import { DetailFormPage } from "./pages/DetailFormPage/DetailFormPage"
import { FillFormPage } from "./pages/FillFormPage/FillFormPage"
import { FormsPage } from "./pages/FormPage/FormPage"
import { LoginPage } from "./pages/LoginPage/LoginPage"
import { RegisterPage } from "./pages/RegisterPage/RegisterPage"
import { JoinPage } from "./pages/JoinPage/JoinPage"
import { ResponsesPage } from "./pages/ResponsesPage/ResponsesPage"
import { FormSettingsPage } from "./pages/FormSettingsPage/FormSettingsPage"
import { FormTermsPage } from "./pages/FormTermsPage/FormTermsPage"
import { AccountTermsPage } from "./pages/AccountTermsPage/AccountTermsPage"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useLocalStorage } from "./hooks/useLocalStorage"

function hasValidToken(token: unknown): boolean {
  return typeof token === 'string' && token.trim().length > 0
}

function HomePage() {
  const [token] = useLocalStorage("token")
  
  if (hasValidToken(token)) {
    return <Navigate to="/forms" replace />
  }
  
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forms/:id/fill" element={<FillFormPage />} />
        <Route path="/forms/:id/terms" element={<FormTermsPage />} />
        <Route path="/join" element={<JoinPage />} />

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
            path="/forms/account/terms"
            element={
              <ProtectedRoute>
                <AccountTermsPage />
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
            path="/forms/edit/:id/settings"
            element={
              <ProtectedRoute>
                <FormSettingsPage />
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
