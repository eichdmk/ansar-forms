import { FormsRepository } from "./forms.repository";
import {pool} from '../../db'
import { FormService } from "./forms.service";
import { FormsController } from "./forms.controller";

export function createFormModule(){
    const repository = new FormsRepository(pool)
    const service = new FormService(repository)
    const controller = new FormsController(service)

    return {
        controller
    }
}