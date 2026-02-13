import { Pool } from "pg";
import { FormInvite } from "./form-access.types.js";

export class FormInvitesRepository{
    constructor(private pool: Pool){}


    async create(form_id: string, role: 'editor' | 'viewer', expires_at?: Date){
        const token = crypto.randomUUID()
        const {rows} = await this.pool.query("INSERT INTO form_invites(token, role, expires_at, form_id) VALUES($1, $2, $3, $4) RETURNING *", [token, role, expires_at, form_id])

        return rows[0]

    }

    async findByToken(token: string){
        const {rows} = await this.pool.query<FormInvite>("SELECT * FROM form_invites WHERE token = $1 AND (expires_at IS NULL OR expires_at > now()) AND used_at IS NULL", [token])

        return rows[0]
    }

    async markUsed(id: string){
        await this.pool.query("UPDATE form_invites SET used_at = now() WHERE id = $1", [id])
    }
}