import { useState } from "react";
import { authAPI } from "../../api";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { AxiosError } from "axios";

export function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [value, setValue] = useLocalStorage('token')


    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        setError('')
        setLoading(true)
        try {
            const result = await authAPI.login({ email, password })
            setValue(result)
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>;
            if (error.response) {
                const msg = error.response.data?.error ?? "Произошла ошибка";
                console.log(msg);
                setError(msg);
            } else {
                setError("Произошла ошибка");
            }
        } finally {
            setLoading(false)
        }
    }



    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <button disabled={loading} type="submit">Войти</button>
            </form>
            {error && <p>{error}</p>}
        </>
    )
}