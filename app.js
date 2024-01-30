import express, { json } from 'express'
import cors from 'cors'
import { moviesRouter } from './routes/movies.js'

const app = express()
app.disable('x-powered-by')

app.use(json())
app.use(cors({
	origin: (origin, callback) => {
		const ACCEPTED_ORIGINS = [
			'http://localhost:1234',
            'http://localhost:8080',
            'http://movies.com',
		]
		// validamos si esta en los permitidos
		if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
        }
        // o si no lo obtenemos (asumiendo que es el mismo dominio)
        if (!origin) {
            return callback(null, true)
        }
        // si no devolvemos que no tiene accesos
        return callback(new Error('Not allowed by CORS'))
    }
}))

app.use('/movies', moviesRouter)

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})
