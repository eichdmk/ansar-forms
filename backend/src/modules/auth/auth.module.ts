import { AuthRepository } from "./auth.repository";
import {pool} from '../../db'
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

export function createAuthModule(){
    const repository = new AuthRepository(pool)
    const service = new AuthService(repository)
    const controller = new AuthController(service)

    return{
        controller
    }
}