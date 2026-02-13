import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponsesService } from './responses.service.js'
import { CreateResponseDto } from './responses.types.js'

export class ResponsesController {
    constructor(private responsesService: ResponsesService) { }

    getResponses = async (req: FastifyRequest, reply: FastifyReply) => {
        const formId = (req as any).params.formId
        const userId = (req as any).user?.id
        if (!userId) {
            return reply.status(401).send({ error: 'Необходима авторизация' })
        }
        const query = (req as any).query || {}
        const page = query.page != null ? Number(query.page) : 1
        const limit = query.limit != null ? Number(query.limit) : 1
        const fromDate = query.fromDate ? String(query.fromDate) : undefined
        const result = await this.responsesService.list(formId, userId, page, limit, fromDate)
        reply.send(result)
    }

    createResponse = async (req: FastifyRequest, reply: FastifyReply) => {
        const formId = (req as any).params.formId
        const dto = req.body as CreateResponseDto
        const result = await this.responsesService.create(formId, dto)
        reply.send(result)
    }
}
