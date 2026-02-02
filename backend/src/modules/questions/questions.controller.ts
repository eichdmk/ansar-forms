import { QuestionService } from "./questions.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuestionDto, UpdateQuestionDto } from "./questions.types";

export class QuestionContoller {
    constructor(private questionService: QuestionService) { }


    findAllQuestions = async (req: FastifyRequest, reply: FastifyReply) => {
        const form_id = (req as any).params.id

        const result = await this.questionService.findAll(form_id)

        reply.send(result)
    }

    createQuestion = async (req: FastifyRequest, reply: FastifyReply) => {
        const owner_id = (req as any).user.id
        const form_id = (req as any).params.formId
        const dto = req.body as CreateQuestionDto

        const result = await this.questionService.create(dto, form_id, owner_id)

        reply.send(result)
    }

    updateQuestiion = async (req: FastifyRequest, reply: FastifyReply) => {
        const form_id = (req as any).params.id
        const question_id = (req as any).params.questionId
        const dto = req.body as UpdateQuestionDto
        const owner_id = (req as any).user.id


        const result = await this.questionService.update(question_id, dto, form_id, owner_id)

        reply.send(result)
    }

    deleteQuestion = async (req: FastifyRequest, reply: FastifyReply) => {
        const form_id = (req as any).params.id
        const question_id = (req as any).params.questionId
        const owner_id = (req as any).user.id

        const result = await this.questionService.delete(question_id, owner_id, form_id)

        reply.send(result)
    }
}