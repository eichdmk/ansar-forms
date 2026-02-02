import {Pool} from 'pg'
import { LoginUserDto, User } from './auth.types'

export class AuthRepository{
    constructor(private pool: Pool){}

    findUserByEmail= async (email: string) =>{
        const {rows} = await this.pool.query<User>("SELECT * FROM users WHERE email = $1", [email])
        return rows[0]
    }

    createUser = async (dto: LoginUserDto) =>{
        const {rows} = await this.pool.query("INSERT INTO users(email, hash_password) VALUES($1, $2) RETURNING id, name", [dto.email, dto.password])
        return rows[0]
    }
}