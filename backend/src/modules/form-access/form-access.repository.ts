import { Pool } from 'pg'
import { FormAccessRole } from './form-access.types';

export class FormAccessRepository {
    constructor(private pool: Pool) { }

    async addAccess(formId: string, userId: string, role: Omit<FormAccessRole, 'owner'>) {
        const { rows } = await this.pool.query("INSERT INTO form_access(form_id, user_id, role) VALUES($1, $2, $3) RETURNING *", [formId, userId, role])
        return rows[0]
    }

    async removeAccess(formId: string, userId: string) {
        const { rows } = await this.pool.query("DELETE FROM form_access WHERE form_id = $1 AND user_id = $2 RETURNING *", [formId, userId])
        return rows[0]
    }

    async getAccessList(formId: string) {
        const { rows } = await this.pool.query(`
            SELECT fa.id, fa.form_id, fa.user_id, fa.role, u.email
            FROM form_access AS fa
            LEFT JOIN users AS u ON u.id = fa.user_id
            WHERE fa.form_id = $1
            ORDER BY fa.id DESC
            `, [formId])
        return rows
    }

    async getUserRole(form_id: string, user_id: string) {
        const { rows } = await this.pool.query("SELECT role FROM form_access WHERE form_id = $1 AND user_id = $2", [form_id, user_id])

        return rows[0]?.role ?? null

    }

    async findFormIdsForUser(user_id: string){
        const {rows} = await this.pool.query("SELECT form_id FROM form_access WHERE user_id = $1", [user_id])
        
        return rows.map(r => r.form_id)
    }
}