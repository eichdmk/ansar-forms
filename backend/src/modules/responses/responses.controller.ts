import { FastifyReply, FastifyRequest } from 'fastify'
import { ResponsesService } from './responses.service.js'
import { CreateResponseDto } from './responses.types.js'

type ParamsFormId = { Params: { formId: string } }
type GetResponsesReq = { Params: { formId: string }; Querystring: { page?: string; limit?: string; fromDate?: string } }

export class ResponsesController {
    constructor(private responsesService: ResponsesService) { }

    getResponses = async (req: FastifyRequest<GetResponsesReq>, reply: FastifyReply) => {
        const formId = req.params.formId
        const userId = req.user?.id
        if (!userId) {
            return reply.status(401).send({ error: 'Необходима авторизация' })
        }
        const query = req.query || {}
        const page = query.page != null ? Number(query.page) : 1
        const limit = query.limit != null ? Number(query.limit) : 1
        const fromDate = query.fromDate ? String(query.fromDate) : undefined
        const result = await this.responsesService.list(formId, userId, page, limit, fromDate)
        reply.send(result)
    }

    createResponse = async (req: FastifyRequest<ParamsFormId>, reply: FastifyReply) => {
        const formId = req.params.formId
        const dto = req.body as CreateResponseDto
        const result = await this.responsesService.create(formId, dto)
        reply.send(result)
    }
}
