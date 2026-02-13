import { BadRequestError, NotFoundError } from "../../errors.js";
import { AuthRepository } from "./auth.repository.js";
import { LoginUserDto } from "./auth.types.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const JWT_TOKEN = process.env.JWT_TOKEN as string

export class AuthService {
    constructor(private authRepository: AuthRepository) { }

    login = async (dto: LoginUserDto) => {
        if (!dto.email || !dto.password) {
            throw new BadRequestError('Введите данные корректно')
        }

        const user = await this.authRepository.findUserByEmail(dto.email)

        if (!user) {
            throw new NotFoundError('Такого пользователя не существует')
        }

        const isMatch = await bcrypt.compare(dto.password, user.hash_password)

        if (!isMatch) {
            throw new BadRequestError('Неправильный логин или пароль!')
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_TOKEN, { expiresIn: '1d' })

        return token
    }

    register = async (dto: LoginUserDto) => {
        if (!dto.email || !dto.password) {
            throw new BadRequestError('Введите данные корректно')
        }

        const user = await this.authRepository.findUserByEmail(dto.email)

        if(user){
            throw new BadRequestError('Такой пользователь уже существует')
        }

        const hash_password = await bcrypt.hash(dto.password, 10)

        const result = await this.authRepository.createUser({email: dto.email, password: hash_password})

        return result
    }

}