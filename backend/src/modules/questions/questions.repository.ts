import { Pool } from 'pg'
import { CreateQuestionDto, Question, UpdateQuestionDto } from './questions.types'

export class QuestionsRepository {
    constructor(private pool: Pool) { }

    findAllquestions = async (form_id: string) => {
        const { rows } = await this.pool.query<Question>('SELECT * FROM questions WHERE form_id = $1 ORDER BY "order"', [form_id])
        return rows
    }

    findQuestionById = async (id: string) => {
        const { rows } = await this.pool.query<Question>("SELECT * FROM questions WHERE id = $1", [id])
        return rows[0]
    }

    createQuestion = async (dto: CreateQuestionDto, form_id: string) => {
        const { rows } = await this.pool.query<Question>('INSERT INTO questions(type, label, required, "order", options, form_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *', [dto.type, dto.label, dto.required, dto.order, dto.options ?? null, form_id])
        return rows[0]
    }

    updateQuestion = async (dto: UpdateQuestionDto, id: string) => {
        const { rows } = await this.pool.query<Question>('UPDATE questions SET type = $1, label = $2, required = $3, "order" = $4, options = $5 WHERE id = $6 RETURNING *', [dto.type, dto.label, dto.required, dto.order, dto.options ?? null, id])
        return rows[0]
    }

    deleteQuestion = async (id: string) => {
        const { rows } = await this.pool.query<Question>("DELETE FROM questions WHERE id = $1 RETURNING *", [id])

        return rows[0]
    }
}