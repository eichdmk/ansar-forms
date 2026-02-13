import { FormsRepository } from "./forms.repository.js";
import { pool } from '../../db.js'
import { FormService } from "./forms.service.js";
import { FormsController } from "./forms.controller.js";
import { FormAccessService } from "../form-access/form-access.service.js";

export function createFormModule(formAccessService: FormAccessService) {
    const repository = new FormsRepository(pool)
    const service = new FormService(repository, formAccessService)
    const controller = new FormsController(service)

    return {
        controller,
        service
    }
}