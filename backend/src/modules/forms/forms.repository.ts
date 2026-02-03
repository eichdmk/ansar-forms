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
        const { rows } = await this.pool.query<Form>('UPDATE forms SET title = $1, description = $2, is_published = $3 WHERE id = $4 RETURNING *', [dto.title, dto.description, dto.is_published, id])

        return rows[0]
    }

    deleteForm = async (id: string) => {
        const { rows } = await this.pool.query("DELETE FROM forms WHERE id = $1 RETURNING *", [id])

        return rows[0]
    }
}