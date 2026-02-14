import { useEffect, useState } from "react"

export function useLocalStorage(key: string, defaultValue?: any){
    const data = localStorage.getItem(key)


    const [value, setValue] = useState(data ? data : defaultValue)


    useEffect(() => {
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, value)
        }
    }, [key, value])

    return [value, setValue]
}