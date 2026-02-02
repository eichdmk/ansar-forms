import Fastify from 'fastify'
import { createFormModule } from './modules/forms/forms.module.js'
import { AppError } from './errors.js'
import { ParamsId } from './modules/forms/forms.types.js'
import { createAuthModule } from './modules/auth/auth.module.js'
import dotenv from 'dotenv'
import { authRequired } from './middleware/auth.js'
dotenv.config()

const app = Fastify()

const formModule = createFormModule()
const authModule = createAuthModule()

app.register(async (instance) => {
    instance.post('/forms', {preHandler: authRequired}, (req, reply) => formModule.controller.createForm(req, reply))
    instance.get<ParamsId>('/forms/:id', (req, reply) => formModule.controller.getFormById(req, reply))
    instance.get('/forms', {preHandler: authRequired}, (req, reply) => formModule.controller.getForms(req, reply))
    instance.put<ParamsId>('/forms/:id', {preHandler: authRequired}, (req, reply) => formModule.controller.updateForm(req, reply))
    instance.delete<ParamsId>('/forms/:id', {preHandler: authRequired}, (req, reply) => formModule.controller.deleteForm(req, reply))
}, { prefix: '/api' })

app.register(async (instance)=>{
    instance.post('/auth/login', (req, reply)=> authModule.controller.login(req, reply))
    instance.post('/auth/register', (req, reply)=> authModule.controller.register(req, reply))
}, { prefix: '/api' })


app.setErrorHandler((error, request, reply) => {
    request.log?.error(error) ?? console.error(error)
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message })
    }
    reply.status(500).send({ error: 'Внутренняя ошибка сервера' })
})

export default app
