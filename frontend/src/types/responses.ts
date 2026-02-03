export interface AnswerDto {
  questionId: string
  value: string | string[]
}

export interface CreateResponseDto {
  answers: AnswerDto[]
}
