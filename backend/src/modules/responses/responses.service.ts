import { ResponsesRepository } from './responses.repository'
import { FormService } from '../forms/forms.service'
import { QuestionsRepository } from '../questions/questions.repository'
import { BadRequestError, NotFoundError } from '../../errors'
import { CreateResponseDto } from './responses.types'

export class ResponsesService {
    constructor(
        private responsesRepository: ResponsesRepository,
        private formService: FormService,
        private questionsRepository: QuestionsRepository
    ) { }

    create = async (formId: string, dto: CreateResponseDto) => {
        if (!formId) {
            throw new BadRequestError('id формы не указан')
        }

        const form = await this.formService.findById(formId)
        if (!form) {
            throw new NotFoundError('Форма не найдена')
        }

        if (!form.is_published) {
            throw new BadRequestError('Форма не опубликована, ответы отключены')
        }

        const formQuestions = await this.questionsRepository.findAllquestions(formId)
        const questionIds = new Set(formQuestions.map((q) => q.id))

        for (const a of dto.answers) {
            if (!questionIds.has(a.questionId)) {
                throw new BadRequestError(`Вопрос ${a.questionId} не принадлежит этой форме`)
            }
        }

        const hasValue = (v: unknown) => {
            if (v === undefined || v === null) return false
            if (typeof v === 'string' && v.trim() === '') return false
            if (Array.isArray(v) && v.length === 0) return false
            return true
        }
        const answersByQ = new Map(dto.answers.map((a) => [a.questionId, a]))
        for (const q of formQuestions) {
            if (!q.required) continue
            const a = answersByQ.get(q.id)
            if (!a || !hasValue(a.value)) {
                throw new BadRequestError(`Обязательный вопрос "${q.label}" не заполнен`)
            }
        }

        const response = await this.responsesRepository.createResponse(formId)

        for (const a of dto.answers) {
            const value = a.value
            if (value === undefined || value === null) continue
            if (typeof value === 'string' && value.trim() === '') continue
            if (Array.isArray(value) && value.length === 0) continue
            await this.responsesRepository.createAnswer(response.id, a.questionId, value)
        }

        return response
    }
}
