export interface User {
    id: string
    email: string
    hash_password?: string
    terms_text?: string | null
}

export interface LoginUserDto{
    email: string
    password: string
}

export type JwtPayload = {
    id: string
    email: string
}