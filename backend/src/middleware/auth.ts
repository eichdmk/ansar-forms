import { FastifyReply, FastifyRequest } from "fastify";
import { NoAccessToken } from "../errors.js";
import jwt from 'jsonwebtoken'
import { JwtPayload } from "../modules/auth/auth.types.js";


const JWT_TOKEN = process.env.JWT_TOKEN as string

export async function authRequired(req: FastifyRequest, _: FastifyReply) {
    try {
        const token = req.headers['authorization']?.split(' ')[1]


        if (!token) {
            throw new NoAccessToken()
        }

        const decoded = jwt.verify(token, JWT_TOKEN) as JwtPayload

        req.user = {
            id: decoded.id,
            email: decoded.email
        }
    } catch (error) {
        throw new NoAccessToken('Неверный или истёкший токен')
    }
}