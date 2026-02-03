import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { FormsRepository } from "./forms.repository";
import { CreateFormDto, UpdateFormDto } from "./forms.types";

export class FormService {
    constructor(private formRepository: FormsRepository) { }

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

    findForms = async (owner_id: string) => {
        const result = await this.formRepository.findAllForms(owner_id)

        return result

    }

    findById = async (id: string) => {
        if (!id) {
            throw new BadRequestError('Отствует id')
        }

        const result = await this.formRepository.findFormById(id)

        if (!result) {
            throw new NotFoundError('Такой формы не существует')
        }

        return result

    }

    update = async (id: string, dto: UpdateFormDto, owner_id: string) => {
        if (!dto.title) {
            throw new BadRequestError('Введите корректные данные!')
        }

        if (!id) {
            throw new BadRequestError('Отсутствует id')
        }

        const form = await this.formRepository.findFormById(id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }

        if (form.owner_id !== owner_id) {
            throw new ForbiddenError()
        }

        const result = await this.formRepository.updateForm(id, dto)

        return result
    }

    delete = async (id: string, owner_id: string) => {
        if (!id) {
            throw new BadRequestError('Отсутствует id')
        }


        const form = await this.formRepository.findFormById(id)

        if (!form) {
            throw new NotFoundError('Такой формы не существует')
        }


        if (form.owner_id !== owner_id) {
            throw new ForbiddenError()
        }

        const result = await this.formRepository.deleteForm(id)

        return result
    }
}