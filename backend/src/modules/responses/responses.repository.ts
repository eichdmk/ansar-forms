import { Pool } from 'pg'
import { Response, Answer } from './responses.types'

export class ResponsesRepository {
    constructor(private pool: Pool) { }

    createResponse = async (form_id: string) => {
        const { rows } = await this.pool.query<Response>(
            'INSERT INTO responses(form_id) VALUES($1) RETURNING *',
            [form_id]
        )
        return rows[0]
    }

    createAnswer = async (response_id: string, question_id: string, value: unknown) => {
        const { rows } = await this.pool.query<Answer>(
            'INSERT INTO answers(response_id, question_id, value) VALUES($1, $2, $3) RETURNING *',
            [response_id, question_id, JSON.stringify(value !== undefined && value !== null ? value : '')]
        )
        return rows[0]
    }
}
