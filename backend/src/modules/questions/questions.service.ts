import { QuestionsRepository } from "./questions.repository.js";
import { BadRequestError, ForbiddenError, NotFoundError } from '../../errors.js'
import { CreateQuestionDto, UpdateQuestionDto } from "./questions.types.js";
import { FormService } from "../forms/forms.service.js";
import { FormAccessService } from "../form-access/form-access.service.js";
import { FormAccessRole } from "../form-access/form-access.types.js";

const CAN_EDIT_ROLES: FormAccessRole[] = ['owner', 'editor']

function canEditForm(role: FormAccessRole | null): boolean {
    return role !== null && CAN_EDIT_ROLES.includes(role)
}

export class QuestionService {
    constructor(
        private questionRepository: QuestionsRepository,
        private formService: FormService,
        private formAccessService: FormAccessService
    ) { }

    findAll = async (form_id: string) => {
        if (!form_id) {
            throw new BadRequestError("id не указан")
        }

        const questions = await this.questionRepository.findAllquestions(form_id)

        return questions
    }

    findById = async (id: string) => {
        if (!id) {
            throw new BadRequestError("id не указан")
        }

        const question = await this.questionRepository.findQuestionById(id)

        if (!question) {
            throw new NotFoundError("Вопрос не найден")
        }

        return question
    }

    create = async (dto: CreateQuestionDto, form_id: string, owner_id: string) => {
        if (!form_id) {
            throw new BadRequestError("id не указан")
        }

        if (!dto.label || dto.order == null || !dto.type) {
            throw new BadRequestError('Введите данные корректно!')
        }

        const form = await this.formService.findById(form_id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        const role = await this.formAccessService.getUserFormRole(form_id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError('У вас нет прав на добавление вопросов!')
        }

        const result = await this.questionRepository.createQuestion(dto, form_id)

        return result
    }

    update = async (id: string, dto: UpdateQuestionDto, form_id: string, owner_id: string) => {
        if (!form_id) {
            throw new BadRequestError("id не указан")
        }

        if (!dto.label || dto.order == null || !dto.type) {
            throw new BadRequestError('Введите данные корректно!')
        }

        const form = await this.formService.findById(form_id)
        const question = await this.questionRepository.findQuestionById(id)

        if (!question) {
            throw new NotFoundError("Вопрос не найден")
        }

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        if (question.form_id !== form_id) {
            throw new ForbiddenError('Вопрос не принадлежит этой форме')
        }

        const role = await this.formAccessService.getUserFormRole(form_id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError('У вас нет прав на редактирование вопросов!')
        }

        const result = await this.questionRepository.updateQuestion(dto, id)

        return result
    }

    delete = async (id: string, owner_id: string, form_id: string) => {
        if (!id) {
            throw new BadRequestError("id не указан")
        }

        const form = await this.formService.findById(form_id)
        const question = await this.questionRepository.findQuestionById(id)

        if (!question) {
            throw new NotFoundError("Вопрос не найден")
        }

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        if (question.form_id !== form_id) {
            throw new ForbiddenError('Вопрос не принадлежит этой форме')
        }

        const role = await this.formAccessService.getUserFormRole(form_id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError('У вас нет прав на удаление вопросов!')
        }

        const result = await this.questionRepository.deleteQuestion(id)

        return result
    }

}