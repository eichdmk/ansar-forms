import { ProtectedRoute } from "./components/ProtectedRoute"
import { DetailFormPage } from "./pages/DetailFormPage/DetailFormPage"
import { FillFormPage } from "./pages/FillFormPage/FillFormPage"
import { FormsPage } from "./pages/FormPage/FormPage"
import { LoginPage } from "./pages/LoginPage/LoginPage"
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/forms/:id/fill" element={<FillFormPage />} />

          <Route path="/forms"
            element={
              <ProtectedRoute>
                <FormsPage />
              </ProtectedRoute>} />

          <Route path="/forms/edit/:id" element={
            <ProtectedRoute>
              <DetailFormPage />
            </ProtectedRoute>} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
