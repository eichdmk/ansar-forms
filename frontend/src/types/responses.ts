export interface AnswerDto {
  questionId: string
  value: string | string[]
}

export interface CreateResponseDto {
  answers: AnswerDto[]
}

export interface AnswerView {
  question_id: string
  value: unknown
}

export interface ResponseWithAnswers {
  id: string
  form_id: string
  created_at: string
  answers: AnswerView[]
}

export interface ResponsesPageResult {
  items: ResponseWithAnswers[]
  total: number
  page: number
  limit: number
}
