import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors.js";
import { FormsRepository } from "./forms.repository.js";
import { CreateFormDto, UpdateFormDto } from "./forms.types.js";
import { FormAccessService } from '../form-access/form-access.service.js'
import { FormAccessRole } from '../form-access/form-access.types.js'

const CAN_EDIT_ROLES: FormAccessRole[] = ['owner', 'editor']

function canEditForm(role: FormAccessRole | null): boolean {
    return role !== null && CAN_EDIT_ROLES.includes(role)
}

export class FormService {
    constructor(private formRepository: FormsRepository, private formAccessService: FormAccessService) { }

    create = async (dto: CreateFormDto, owner_id: string) => {
        if (!owner_id) {
            throw new BadRequestError('Отствует id пользователя')
        }

        if (!dto.title) {
            throw new BadRequestError('Введите корректные данные!')
        }

        const result = await this.formRepository.createForm(dto, owner_id)

        if (!result) {
            throw new Error('Ошибка при создании формы')
        }

        return result
    }

    findForms = async (userId: string) => {
        return await this.formRepository.findAllFormsForUser(userId)
    }

    findById = async (id: string) => {
        if (!id) {
            throw new BadRequestError('Отствует id')
        }

        const result = await this.formRepository.findFormByIdWithOwnerTerms(id)

        if (!result) {
            throw new NotFoundError('Такой формы не существует')
        }

        const { owner_terms_text, ...form } = result
        return { ...form, owner_terms_text: owner_terms_text ?? null }
    }

    getFormTermsForPublic = async (id: string) => {
        if (!id) throw new BadRequestError('Отсутствует id')
        const row = await this.formRepository.findFormTermsForPublic(id)
        if (!row) throw new NotFoundError('Такой формы не существует')
        return { form_title: row.title, terms_text: row.terms_text ?? '' }
    }

    findByIdWithRole = async (id: string, userId: string) => {
        if (!id) throw new BadRequestError('Отсутствует id')
        const form = await this.formRepository.findFormById(id)
        if (!form) throw new NotFoundError('Такой формы не существует')
        const role = await this.formAccessService.getUserFormRole(id, userId)
        if (role === null) throw new ForbiddenError()
        return { ...form, role }
    }

    update = async (id: string, dto: UpdateFormDto, owner_id: string) => {
        if (!id) {
            throw new BadRequestError('Отсутствует id')
        }

        if (dto.title !== undefined && !dto.title.trim()) {
            throw new BadRequestError('Название формы не может быть пустым')
        }

        const form = await this.formRepository.findFormById(id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        const role = await this.formAccessService.getUserFormRole(id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError()
        }

        const result = await this.formRepository.updateForm(id, dto)

        return result
    }

    updateStatus = async (id: string, is_published: boolean, owner_id: string) => {
        if (!id) {
            throw new BadRequestError('Отсутствует id')
        }

        const form = await this.formRepository.findFormById(id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        const role = await this.formAccessService.getUserFormRole(id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError()
        }

        const updated = await this.formRepository.updateFormStatus(id, is_published)
        return { ...updated, role }
    }

    delete = async (id: string, owner_id: string) => {
        if (!id) {
            throw new BadRequestError('Отсутствует id')
        }


        const form = await this.formRepository.findFormById(id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        const role = await this.formAccessService.getUserFormRole(id, owner_id)
        if (!canEditForm(role)) {
            throw new ForbiddenError()
        }

        const result = await this.formRepository.deleteForm(id)

        return result
    }
}