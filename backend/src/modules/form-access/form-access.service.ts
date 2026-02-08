import { FormAccessRepository } from "./form-access.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors'
import { CreateInviteDto, FormAccessRole } from "./form-access.types";
import { FormInvitesRepository } from "./form-invites.repository";
import { FormsRepository } from '../forms/forms.repository'

export class FormAccessService {
    constructor(private formsRepository: FormsRepository, private formAccessRepository: FormAccessRepository, private formInvitesRepository: FormInvitesRepository) { }


    async getUserFormRole(formId: string, userId: string): Promise<FormAccessRole | null> {

        const form = await this.formsRepository.findFormById(formId)

        if (!form) {
            throw new NotFoundError()
        }

        if (form.owner_id === userId) {
            return "owner"
        }

        const role = await this.formAccessRepository.getUserRole(formId, userId)

        return role
    }

    async addAccess(formId: string, userId: string, role: 'editor' | 'viewer', currentUserId: string) {
        const currentUserRole = await this.getUserFormRole(formId, currentUserId)

        if (currentUserRole !== 'owner') {
            throw new ForbiddenError()
        }

        await this.formAccessRepository.addAccess(formId, userId, role)
    }

    async removeAccess(formId: string, targetUserId: string, currentUserId: string) {
        const currentUserRole = await this.getUserFormRole(formId, currentUserId)

        if (currentUserRole !== 'owner') {
            throw new ForbiddenError()
        }

        await this.formAccessRepository.removeAccess(formId, targetUserId)
    }

    async getAccessList(formId: string, currentUserId: string) {
        const currentUserRole = await this.getUserFormRole(formId, currentUserId)

        if (currentUserRole !== 'owner') {
            throw new ForbiddenError()
        }

        return await this.formAccessRepository.getAccessList(formId)
    }

    async createInvite(formId: string, dto: CreateInviteDto, currentUserId: string) {
        const currentUserRole = await this.getUserFormRole(formId, currentUserId)

        if (currentUserRole !== 'owner') {
            throw new ForbiddenError()
        }

        const expiresAt = dto.expiresInHours ? new Date(Date.now() + dto.expiresInHours * 60 * 60 * 1000) : undefined
        const invite = await this.formInvitesRepository.create(formId, dto.role, expiresAt)

        return { ...invite, link: `${process.env.BASE_URL ?? ''}/join?token=${invite.token}` }
    }

    async acceptInvite(token: string, userId: string) {
        const findedToken = await this.formInvitesRepository.findByToken(token)

        if (!findedToken || (findedToken.expires_at != null && findedToken.expires_at.getTime() < Date.now())) {
            throw new NotFoundError()
        }

        await this.formAccessRepository.addAccess(findedToken.form_id, userId, findedToken.role as 'editor' | 'viewer')

        await this.formInvitesRepository.markUsed(findedToken.id)

        return {form_id: findedToken.form_id}
    }

}