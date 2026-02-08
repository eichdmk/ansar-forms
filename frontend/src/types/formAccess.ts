export interface FormAccessWithUser {
  id: string
  form_id: string
  user_id: string
  role: string
  email: string
}

export interface CreateInviteDto {
  role: 'editor' | 'viewer'
  expiresInHours?: number
}

export interface CreateInviteResult {
  id: string
  form_id: string
  token: string
  role: string
  created_at: string
  link: string
}

export interface AcceptInviteResult {
  form_id: string
  already_had_access?: boolean
}
