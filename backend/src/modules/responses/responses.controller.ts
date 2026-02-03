import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponsesService } from './responses.service'
import { CreateResponseDto } from './responses.types'

export class ResponsesController {
    constructor(private responsesService: ResponsesService) { }

    createResponse = async (req: FastifyRequest, reply: FastifyReply) => {
        const formId = (req as any).params.formId
        const dto = req.body as CreateResponseDto
        const result = await this.responsesService.create(formId, dto)
        reply.send(result)
    }
}
