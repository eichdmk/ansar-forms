import { FormService } from "./forms.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateFormDto, ParamsId, UpdateFormDto } from "./forms.types";

export class FormsController {
    constructor(private formsService: FormService) { }

    createForm = async (req: FastifyRequest, reply: FastifyReply) => {
        const dto = req.body as CreateFormDto
        const owner_id = (req as any).user.id

        const result = await this.formsService.create(dto, owner_id)

        reply.send(result)
    }

    getForms = async (req: FastifyRequest, reply: FastifyReply) => {
        const owner_id = (req as any).user.id
        const result = await this.formsService.findForms(owner_id)

        reply.send(result)
    }

    getFormById = async (req: FastifyRequest<ParamsId>, reply: FastifyReply) => {
        const id = req.params.id

        const result = await this.formsService.findById(id)

        reply.send(result)
    }

    updateForm = async (req: FastifyRequest<ParamsId>, reply: FastifyReply) => {
        const id = req.params.id
        const owner_id = (req as any).user.id

        const dto = req.body as UpdateFormDto
        const result = await this.formsService.update(id, dto, owner_id)

        reply.send(result)
    }

    deleteForm = async (req: FastifyRequest<ParamsId>, reply: FastifyReply) => {
        const id = req.params.id
        const owner_id = (req as any).user.id

        const result = await this.formsService.delete(id, owner_id)

        reply.send(result)
    }
}