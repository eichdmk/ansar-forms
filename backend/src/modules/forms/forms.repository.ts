import { Pool } from "pg"
import { CreateFormDto, Form, UpdateFormDto } from "./forms.types"

export class FormsRepository {
    constructor(private pool: Pool) { }

    createForm = async (dto: CreateFormDto, owner_id: string) => {
        const { rows } = await this.pool.query<Form>('INSERT INTO forms(owner_id, title, description, is_published) VALUES($1, $2, $3, $4) RETURNING *', [owner_id, dto.title, dto.description ?? null, dto.is_published ?? false])

        return rows[0]
    }

    findFormById = async (id: string) => {
        const { rows } = await this.pool.query<Form>('SELECT * FROM forms WHERE id = $1', [id])
        return rows[0]
    }

    findAllForms = async (owner_id: string) => {
        const { rows } = await this.pool.query<Form>('SELECT * FROM forms WHERE owner_id = $1', [owner_id])

        return rows
    }

    updateForm = async (id: string, dto: UpdateFormDto) => {
        const updates: string[] = []
        const values: unknown[] = []
        let paramIndex = 1

        if (dto.title !== undefined) {
            updates.push(`title = $${paramIndex}`)
            values.push(dto.title)
            paramIndex++
        }

        if (dto.description !== undefined) {
            updates.push(`description = $${paramIndex}`)
            values.push(dto.description)
            paramIndex++
        }

        if (updates.length === 0) {
            return await this.findFormById(id)
        }

        values.push(id)
        const query = `UPDATE forms SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
        
        const { rows } = await this.pool.query<Form>(query, values)

        return rows[0]
    }

    updateFormStatus = async (id: string, is_published: boolean) => {
        const { rows } = await this.pool.query<Form>('UPDATE forms SET is_published = $1 WHERE id = $2 RETURNING *', [is_published, id])

        return rows[0]
    }

    deleteForm = async (id: string) => {
        const { rows } = await this.pool.query("DELETE FROM forms WHERE id = $1 RETURNING *", [id])

        return rows[0]
    }
}