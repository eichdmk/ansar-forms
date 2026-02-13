import app from './app.js'

const PORT = 3000
const HOST = '0.0.0.0' 

app.listen({port: PORT, host: HOST}, (err, address) => {
    if (err) {
        console.error('Ошибка запуска сервера:', err)
        process.exit(1)
    }
    console.log(`Сервер запущен на ${address}`)
    console.log(`Локальный доступ: http://localhost:${PORT}`)
    console.log(`Сетевой доступ: http://[ваш-IP]:${PORT}`)
})