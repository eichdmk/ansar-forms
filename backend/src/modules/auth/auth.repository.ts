import { Pool } from 'pg'
import { LoginUserDto, User } from './auth.types.js'

export class AuthRepository {
    constructor(private pool: Pool) { }

    findUserByEmail = async (email: string) => {
        const { rows } = await this.pool.query<User>("SELECT * FROM users WHERE email = $1", [email])
        return rows[0]
    }

    findById = async (id: string) => {
        const { rows } = await this.pool.query<User>("SELECT id, email, terms_text FROM users WHERE id = $1", [id])
        return rows[0]
    }

    updateTermsText = async (userId: string, terms_text: string | null) => {
        const { rows } = await this.pool.query<User>("UPDATE users SET terms_text = $1 WHERE id = $2 RETURNING id, email, terms_text", [terms_text, userId])
        return rows[0]
    }

    createUser = async (dto: LoginUserDto) => {
        const { rows } = await this.pool.query("INSERT INTO users(email, hash_password) VALUES($1, $2) RETURNING id, email", [dto.email, dto.password])
        return rows[0]
    }
}