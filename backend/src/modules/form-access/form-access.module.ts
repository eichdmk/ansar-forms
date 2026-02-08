import { FormAccessRepository } from "./form-access.repository";
import { FormsRepository } from "../forms/forms.repository";
import { FormAccessService } from "./form-access.service";
import { FormInvitesRepository } from "./form-invites.repository";
import { FormAccessController } from "./form-access.controller";
import {pool} from '../../db'

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