import { pool } from '../../db.js'
import { ResponsesRepository } from './responses.repository.js'
import { ResponsesService } from './responses.service.js'
import { ResponsesController } from './responses.controller.js'
import { FormService } from '../forms/forms.service.js'
import { FormAccessService } from '../form-access/form-access.service.js'
import { QuestionsRepository } from '../questions/questions.repository.js'

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
