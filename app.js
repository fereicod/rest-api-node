import express, { json } from 'express'
import cors from 'cors'

import { validateMovie, validatePartialMovie } from './schema/movies.js'
import { readJSON } from './utils.js'

const movies = readJSON('./movies.json')

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

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return res.json(movie)

    res.status(404).json({message: 'Not found'})
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
    if (result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    // Esto no seria REST, porque estamos guardando
    // el estado de la aplicacion en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    if (!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if(movieIndex === -1){
        res.status(404).json({message: 'Not found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    // Esto no seria REST, porque estamos guardando
    // el estado de la aplicacion en memoria
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})
