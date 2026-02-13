import { AuthRepository } from "./auth.repository.js";
import {pool} from '../../db.js'
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";

export function createAuthModule(){
    const repository = new AuthRepository(pool)
    const service = new AuthService(repository)
    const controller = new AuthController(service)

    return{
        controller
    }
}