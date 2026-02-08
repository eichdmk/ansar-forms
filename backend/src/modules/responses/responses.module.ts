import { pool } from '../../db'
import { ResponsesRepository } from './responses.repository'
import { ResponsesService } from './responses.service'
import { ResponsesController } from './responses.controller'
import { FormService } from '../forms/forms.service'
import { FormAccessService } from '../form-access/form-access.service'
import { QuestionsRepository } from '../questions/questions.repository'

export function createResponsesModule(formService: FormService, formAccessService: FormAccessService) {
    const responsesRepository = new ResponsesRepository(pool)
    const questionsRepository = new QuestionsRepository(pool)
    const responsesService = new ResponsesService(
        responsesRepository,
        formService,
        questionsRepository,
        formAccessService
    )
    const controller = new ResponsesController(responsesService)
    return { controller }
}
