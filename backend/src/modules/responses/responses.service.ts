import { ResponsesRepository } from './responses.repository.js'
import { FormService } from '../forms/forms.service.js'
import { QuestionsRepository } from '../questions/questions.repository.js'
import { FormAccessService } from '../form-access/form-access.service.js'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors.js'
import { CreateResponseDto } from './responses.types.js'
import { FormAccessRole } from '../form-access/form-access.types.js'

const CAN_VIEW_RESPONSES_ROLES: FormAccessRole[] = ['owner', 'editor', 'viewer']

function canViewResponses(role: FormAccessRole | null): boolean {
    return role !== null && CAN_VIEW_RESPONSES_ROLES.includes(role)
}

export class ResponsesService {
    constructor(
        private responsesRepository: ResponsesRepository,
        private formService: FormService,
        private questionsRepository: QuestionsRepository,
        private formAccessService: FormAccessService
    ) { }

    list = async (
        formId: string,
        ownerId: string,
        page: number = 1,
        limit: number = 1,
        fromDate?: string
    ) => {
        if (!formId) {
            throw new BadRequestError('id формы не указан')
        }
        const form = await this.formService.findById(formId)
        if (!form) {
            throw new NotFoundError('Форма не найдена')
        }
        const role = await this.formAccessService.getUserFormRole(formId, ownerId)
        if (!canViewResponses(role)) {
            throw new ForbiddenError()
        }
        const pageNum = Math.max(1, Math.floor(page))
        const limitNum = Math.max(1, Math.min(100, Math.floor(limit)))
        const offset = (pageNum - 1) * limitNum
        const [items, total] = await Promise.all([
            this.responsesRepository.getResponsesWithAnswersPaginated(formId, limitNum, offset, fromDate),
            this.responsesRepository.getResponsesCount(formId, fromDate),
        ])
        return { items, total, page: pageNum, limit: limitNum }
    }

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
