import { QuestionService } from "./questions.service.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuestionDto, UpdateQuestionDto } from "./questions.types.js";

type ParamsFormId = { Params: { formId: string } }
type ParamsFormIdQuestionId = { Params: { formId: string; questionId: string } }

export class QuestionContoller {
    constructor(private questionService: QuestionService) { }


    findAllQuestions = async (req: FastifyRequest<ParamsFormId>, reply: FastifyReply) => {
        const form_id = req.params.formId

        const result = await this.questionService.findAll(form_id)

        reply.send(result)
    }

    createQuestion = async (req: FastifyRequest<ParamsFormId>, reply: FastifyReply) => {
        const owner_id = req.user!.id
        const form_id = req.params.formId
        const dto = req.body as CreateQuestionDto

        const result = await this.questionService.create(dto, form_id, owner_id)

        reply.send(result)
    }

    updateQuestion = async (req: FastifyRequest<ParamsFormIdQuestionId>, reply: FastifyReply) => {
        const form_id = req.params.formId
        const question_id = req.params.questionId
        const dto = req.body as UpdateQuestionDto
        const owner_id = req.user!.id


        const result = await this.questionService.update(question_id, dto, form_id, owner_id)

        reply.send(result)
    }

    deleteQuestion = async (req: FastifyRequest<ParamsFormIdQuestionId>, reply: FastifyReply) => {
        const form_id = req.params.formId
        const question_id = req.params.questionId
        const owner_id = req.user!.id

        const result = await this.questionService.delete(question_id, owner_id, form_id)

        reply.send(result)
    }
}