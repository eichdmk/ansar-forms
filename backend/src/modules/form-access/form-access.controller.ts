import { FormAccessService } from "./form-access.service.js";
import { FastifyReply, FastifyRequest } from "fastify";

type ParamsFormId = { Params: { formId: string } }
type ParamsFormIdUserId = { Params: { formId: string; userId: string } }

export class FormAccessController {
    constructor(private formAccessService: FormAccessService) { }

    async getAccessList(req: FastifyRequest<ParamsFormId>, reply: FastifyReply) {
        const formId = req.params.formId
        const userId = req.user!.id

        const list = await this.formAccessService.getAccessList(formId, userId)

        reply.send(list)
    }

    async addAccess(req: FastifyRequest<ParamsFormId>, reply: FastifyReply) {
        const formId = req.params.formId
        const currentUserId = req.user!.id
        const { userId, role } = req.body as { userId: string; role: 'editor' | 'viewer' }

        await this.formAccessService.addAccess(formId, userId, role, currentUserId)
        reply.send({ success: true })
    }

    async removeAccess(req: FastifyRequest<ParamsFormIdUserId>, reply: FastifyReply) {
        const formId = req.params.formId
        const targetUserId = req.params.userId
        const currentUserId = req.user!.id

        await this.formAccessService.removeAccess(formId, targetUserId, currentUserId)
        reply.send({ success: true })
    }

    async createInvite(req: FastifyRequest<ParamsFormId>, reply: FastifyReply) {
        const formId = req.params.formId
        const currentUserId = req.user!.id
        const body = req.body as { role: 'editor' | 'viewer'; expiresInHours?: number }

        const result = await this.formAccessService.createInvite(formId, { role: body.role, expiresInHours: body.expiresInHours }, currentUserId)
        reply.send(result)
    }

    async acceptInvite(req: FastifyRequest, reply: FastifyReply) {
        const { token } = req.body as { token: string }
        const userId = req.user!.id

        const result = await this.formAccessService.acceptInvite(token, userId)
        reply.send(result)
    }
}