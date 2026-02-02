import { QuestionsRepository } from "./questions.repository";
import {pool} from '../../db'
import { FormsRepository } from "../forms/forms.repository";
import { FormService } from "../forms/forms.service";
import { QuestionService } from "./questions.service";
import { QuestionContoller } from "./questions.controller";

export function createQuestionModule(){
    const repository = new QuestionsRepository(pool)
    const formRepository = new FormsRepository(pool)
    const formService = new FormService(formRepository)
    const service = new QuestionService(repository, formService)

    const controller = new QuestionContoller(service)

    return {
        controller
    }
}