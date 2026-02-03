import { Pool } from 'pg'
import { Response, Answer, ResponseWithAnswers } from './responses.types'

interface ResponseRow {
    response_id: string
    form_id: string
    created_at: Date
    question_id: string | null
    value: unknown
}

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

    getResponsesWithAnswers = async (form_id: string): Promise<ResponseWithAnswers[]> => {
        const { rows } = await this.pool.query<ResponseRow>(
            `SELECT r.id AS response_id, r.form_id, r.created_at, a.question_id, a.value
             FROM responses r
             LEFT JOIN answers a ON a.response_id = r.id
             WHERE r.form_id = $1
             ORDER BY r.created_at DESC, a.question_id`,
            [form_id]
        )
        const byResponse = new Map<string, ResponseWithAnswers>()
        for (const row of rows) {
            if (!byResponse.has(row.response_id)) {
                byResponse.set(row.response_id, {
                    id: row.response_id,
                    form_id: row.form_id,
                    created_at: row.created_at,
                    answers: [],
                })
            }
            if (row.question_id != null) {
                const resp = byResponse.get(row.response_id)!
                resp.answers.push({ question_id: row.question_id, value: row.value })
            }
        }
        return Array.from(byResponse.values())
    }
}
