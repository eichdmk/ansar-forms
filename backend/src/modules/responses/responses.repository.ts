import { Pool } from 'pg'
import { Response, Answer, ResponseWithAnswers } from './responses.types.js'

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

    getResponsesCount = async (form_id: string, fromDate?: string): Promise<number> => {
        if (fromDate) {
            const { rows } = await this.pool.query<{ count: string }>(
                'SELECT COUNT(*) AS count FROM responses WHERE form_id = $1 AND created_at >= $2',
                [form_id, fromDate]
            )
            return parseInt(rows[0]?.count ?? '0', 10)
        }
        const { rows } = await this.pool.query<{ count: string }>(
            'SELECT COUNT(*) AS count FROM responses WHERE form_id = $1',
            [form_id]
        )
        return parseInt(rows[0]?.count ?? '0', 10)
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
        return this.groupRowsIntoResponses(rows)
    }

    getResponsesWithAnswersPaginated = async (
        form_id: string,
        limit: number,
        offset: number,
        fromDate?: string
    ): Promise<ResponseWithAnswers[]> => {
        if (fromDate) {
            const { rows } = await this.pool.query<ResponseRow>(
                `SELECT r.id AS response_id, r.form_id, r.created_at, a.question_id, a.value
                 FROM (
                   SELECT id, form_id, created_at FROM responses
                   WHERE form_id = $1 AND created_at >= $4
                   ORDER BY created_at DESC
                   LIMIT $2 OFFSET $3
                 ) r
                 LEFT JOIN answers a ON a.response_id = r.id
                 ORDER BY r.created_at DESC, a.question_id`,
                [form_id, limit, offset, fromDate]
            )
            return this.groupRowsIntoResponses(rows)
        }
        
        const { rows } = await this.pool.query<ResponseRow>(
            `SELECT r.id AS response_id, r.form_id, r.created_at, a.question_id, a.value
             FROM (
               SELECT id, form_id, created_at FROM responses
               WHERE form_id = $1
               ORDER BY created_at DESC
               LIMIT $2 OFFSET $3
             ) r
             LEFT JOIN answers a ON a.response_id = r.id
             ORDER BY r.created_at DESC, a.question_id`,
            [form_id, limit, offset]
        )
        return this.groupRowsIntoResponses(rows)
    }

    private groupRowsIntoResponses(rows: ResponseRow[]): ResponseWithAnswers[] {
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
