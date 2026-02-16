import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import { LoginUserDto } from "./auth.types.js";

export class AuthController{
    constructor(private authService: AuthService){}


    login = async(req: FastifyRequest, reply: FastifyReply)=>{
        const dto = req.body as LoginUserDto

        const token = await this.authService.login(dto)

        reply.send(token)
    }

    register = async (req: FastifyRequest, reply: FastifyReply) => {
        const dto = req.body as LoginUserDto
        const result = await this.authService.register(dto)
        reply.send(result)
    }

    getMe = async (req: FastifyRequest, reply: FastifyReply) => {
        const userId = (req as any).user.id
        const result = await this.authService.getMe(userId)
        reply.send(result)
    }

    updateTerms = async (req: FastifyRequest, reply: FastifyReply) => {
        const userId = (req as any).user.id
        const { terms_text } = req.body as { terms_text?: string }
        const result = await this.authService.updateTerms(userId, typeof terms_text === 'string' ? terms_text : '')
        reply.send(result)
    }
}