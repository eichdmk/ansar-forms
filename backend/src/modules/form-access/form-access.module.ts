import { FormAccessRepository } from "./form-access.repository.js";
import { FormsRepository } from "../forms/forms.repository.js";
import { FormAccessService } from "./form-access.service.js";
import { FormInvitesRepository } from "./form-invites.repository.js";
import { FormAccessController } from "./form-access.controller.js";
import {pool} from '../../db.js'

export function createAccessModule(){
    const accessRepository = new FormAccessRepository(pool)
    const inviteRepository = new FormInvitesRepository(pool)
    const formsRepository = new FormsRepository(pool)
    const service = new FormAccessService(formsRepository, accessRepository, inviteRepository)
    const controller = new FormAccessController(service)

    return {
        controller,
        service
    }
}