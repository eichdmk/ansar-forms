import { QuestionsRepository } from "./questions.repository.js";
import { pool } from '../../db.js'
import { FormService } from "../forms/forms.service.js";
import { FormAccessService } from "../form-access/form-access.service.js";
import { QuestionService } from "./questions.service.js";
import { QuestionContoller } from "./questions.controller.js";

export function createQuestionModule(formService: FormService, formAccessService: FormAccessService) {
    const repository = new QuestionsRepository(pool)
    const service = new QuestionService(repository, formService, formAccessService)

    const controller = new QuestionContoller(service)

    return {
        controller
    }
}