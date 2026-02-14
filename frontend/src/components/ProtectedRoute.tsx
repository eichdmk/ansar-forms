import { Navigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

function hasValidToken(token: unknown): boolean {
    return typeof token === 'string' && token.trim().length > 0
}

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({children}: ProtectedRouteProps){
    const [value] = useLocalStorage('token')

    if (!hasValidToken(value)) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}