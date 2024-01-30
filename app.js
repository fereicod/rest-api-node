const express = require('express')
const cors = require('cors')
const movies = require('./movies.json')

// con esto inicializamos express
const app = express()
//deshabilitar el header X=Powered-By: Express
app.disable('x-powered-by')
// middleware para interpretar json
app.use(express.json())
app.use(cors({
	origin: (origin, callback) => {
		// Creamos una lista de origins permitidos
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
const PORT = process.env.PORT ?? 1234

// Todos los recursos que sean MOVIES se identifican con '/movies'
app.get('/movies', (req, res) => {
    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        res.json(filteredMovies)
    }

    res.json(movies)
})

// Borramos el objeto en especifico
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})
