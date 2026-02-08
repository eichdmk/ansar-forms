import { FormsRepository } from "./forms.repository";
import { pool } from '../../db'
import { FormService } from "./forms.service";
import { FormsController } from "./forms.controller";
import { FormAccessService } from "../form-access/form-access.service";

export function createFormModule(formAccessService: FormAccessService) {
    const repository = new FormsRepository(pool)
    const service = new FormService(repository, formAccessService)
    const controller = new FormsController(service)

    return {
        controller,
        service
    }
}