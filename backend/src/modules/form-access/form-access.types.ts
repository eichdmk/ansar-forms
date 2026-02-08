export type role = 'owner' | 'editor' | 'viewer'

export interface FormAccess{
    id: string,
    form_id: string
    user_id: string
    role: string
    created_at: string
}

export interface FormInvite {
    id: string,
    form_id: string
    token: string
    role: string
    created_at: string
    used_at: string
}

export interface CreateInviteDto{
    expiresInHours?: number
    role: 'editor' | 'viewer'
}
export interface FormAccessWithUser{
    id: string,
    form_id: string
    user_id: string
    role: string
    email: string
}
// CREATE TABLE form_invites(
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
//     token TEXT UNIQUE NOT NULL,
//     role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
//     created_at TIMESTAMP DEFAULT now(),
//     used_at TIMESTAMP
//   );