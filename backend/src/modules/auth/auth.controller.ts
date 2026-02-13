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

    register = async(req: FastifyRequest, reply: FastifyReply)=>{
        const dto = req.body as LoginUserDto

        const result = await this.authService.register(dto)
        
        reply.send(result)
    }
}