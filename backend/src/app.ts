import Fastify from 'fastify'
import { createFormModule } from './modules/forms/forms.module.js'
import { AppError } from './errors.js'
import { ParamsId } from './modules/forms/forms.types.js'
import { createAuthModule } from './modules/auth/auth.module.js'
import { authRequired } from './middleware/auth.js'
import fastifyCors from '@fastify/cors'
import dotenv from 'dotenv'
import { createQuestionModule } from './modules/questions/questions.module.js'
import { createResponsesModule } from './modules/responses/responses.module.js'

dotenv.config()

const app = Fastify()

await app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})
const questionModule = createQuestionModule()
const formModule = createFormModule()
const authModule = createAuthModule()
const responsesModule = createResponsesModule()

app.register(async (instance) => {
    instance.post('/forms', {preHandler: authRequired}, (req, reply) => formModule.controller.createForm(req, reply))
    instance.get<ParamsId>('/forms/:id', (req, reply) => formModule.controller.getFormById(req, reply))
    instance.get('/forms', {preHandler: authRequired}, (req, reply) => formModule.controller.getForms(req, reply))
    instance.put<ParamsId>('/forms/:id', {preHandler: authRequired}, (req, reply) => formModule.controller.updateForm(req, reply))
    instance.patch<ParamsId>('/forms/:id/status', {preHandler: authRequired}, (req, reply) => formModule.controller.updateFormStatus(req, reply))
    instance.delete<ParamsId>('/forms/:id', {preHandler: authRequired}, (req, reply) => formModule.controller.deleteForm(req, reply))
    
    instance.get('/forms/:formId/responses', { preHandler: authRequired }, (req, reply) => responsesModule.controller.getResponses(req, reply))
    instance.post('/forms/:formId/responses', (req, reply) => responsesModule.controller.createResponse(req, reply))
}, { prefix: '/api' })

app.register(async (instance)=>{
    instance.post('/auth/login', (req, reply)=> authModule.controller.login(req, reply))
    instance.post('/auth/register', (req, reply)=> authModule.controller.register(req, reply))
}, { prefix: '/api' })

app.register(async (instance)=>{
    instance.get('/questions/:formId', (req, reply)=> questionModule.controller.findAllQuestions(req, reply))
    instance.post('/questions/:formId', {preHandler: authRequired}, (req, reply)=> questionModule.controller.createQuestion(req, reply))
    instance.put('/questions/:formId/:questionId', {preHandler: authRequired}, (req, reply)=> questionModule.controller.updateQuestion(req, reply))
    instance.delete('/questions/:formId/:questionId', {preHandler: authRequired}, (req, reply)=> questionModule.controller.deleteQuestion(req, reply))
}, { prefix: '/api' })


app.setErrorHandler((error, request, reply) => {
    request.log?.error(error) ?? console.error(error)
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
    }
    reply.status(500).send({ error: 'Внутренняя ошибка сервера' })
})

export default app
