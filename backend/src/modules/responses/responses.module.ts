import { pool } from '../../db'
import { ResponsesRepository } from './responses.repository'
import { ResponsesService } from './responses.service'
import { ResponsesController } from './responses.controller'
import { FormService } from '../forms/forms.service'
import { FormsRepository } from '../forms/forms.repository'
import { QuestionsRepository } from '../questions/questions.repository'

export function createResponsesModule() {
    const responsesRepository = new ResponsesRepository(pool)
    const formsRepository = new FormsRepository(pool)
    const formService = new FormService(formsRepository)
    const questionsRepository = new QuestionsRepository(pool)
    const responsesService = new ResponsesService(
        responsesRepository,
        formService,
        questionsRepository
    )
    const controller = new ResponsesController(responsesService)
    return { controller }
}
