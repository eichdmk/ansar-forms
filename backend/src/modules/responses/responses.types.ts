export interface Response {
    id: string
    form_id: string
    created_at: Date
}

export interface Answer {
    id: string
    response_id: string
    question_id: string
    value: unknown
}

export interface AnswerDto {
    questionId: string
    value: unknown
}

export interface CreateResponseDto {
    answers: AnswerDto[]
}
