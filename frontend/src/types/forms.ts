export type FormAccessRole = 'owner' | 'editor' | 'viewer'

export interface Form {
  id: string
  owner_id: string
  title: string
  description: string
  is_published: boolean
  created_at: Date
  updated_at: Date
  role?: FormAccessRole
  owner_terms_text?: string | null
}

export interface CreateFormDto {
  title: string
  description?: string
  is_published?: boolean
}

export interface UpdateFormDto {
  title?: string
  description?: string
  is_published?: boolean
}
