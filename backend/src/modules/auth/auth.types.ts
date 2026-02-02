export interface User {
    id: string
    email: string
    hash_password: string
}

export interface LoginUserDto{
    email: string
    password: string
}

export type JwtPayload = {
    id: string
    email: string
}