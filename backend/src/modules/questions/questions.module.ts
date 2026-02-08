import { QuestionsRepository } from "./questions.repository";
import { pool } from '../../db'
import { FormService } from "../forms/forms.service";
import { FormAccessService } from "../form-access/form-access.service";
import { QuestionService } from "./questions.service";
import { QuestionContoller } from "./questions.controller";

export function createQuestionModule(formService: FormService, formAccessService: FormAccessService) {
    const repository = new QuestionsRepository(pool)
    const service = new QuestionService(repository, formService, formAccessService)

    const controller = new QuestionContoller(service)

    return {
        controller
    }
}