import { ProtectedRoute } from "./components/ProtectedRoute"
import { FormsPage } from "./pages/FormPage/FormPage"
import { LoginPage } from "./pages/LoginPage/LoginPage"
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>

          <Route path="/forms" 
          element={
          <ProtectedRoute>
            <FormsPage/>
          </ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
