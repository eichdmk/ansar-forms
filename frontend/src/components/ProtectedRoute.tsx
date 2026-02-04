import { Navigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({children}: ProtectedRouteProps){
    const [value] = useLocalStorage('token')

    if(!value){
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}