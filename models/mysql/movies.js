import mysql from 'mysql2/promise'

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
    static getAll = async ({ genre }) => {
        if(genre){
            const lowerCaseGenre = genre.toLowerCase()
            const [genres] = await connection.query(
                'SELECT id, name FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre]
            )
            if(genres.length === 0) return []
            const [{id}] = genres
            const [filterMovies] = await connection.query(
                'SELECT BIN_TO_UUID(m.id) id, m.title, m.year, m.director, m.duration, m.rate '+
                'FROM movie AS m '+
                'JOIN movies_genres as mg '+
                'ON m.id = mg.movie_id '+
                'WHERE mg.genre_id=?;',
                [id]
            )
            return filterMovies
        }
        const [movies] = await connection.query(
            //'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie;'
            'SELECT BIN_TO_UUID(m.id) id, m.title, m.year, m.director, m.duration, m.rate, GROUP_CONCAT(g.name) AS genre '+
            'FROM movie AS m '+
            'JOIN movies_genres as mg '+
            'ON m.id = mg.movie_id '+
            'JOIN genre as g '+
            'ON mg.genre_id = g.id '+
            'GROUP BY m.id;'
        )
        let moviesWithGenres = []
        for(const index in movies){
            let movie = movies[index]
            const {genre} = movie
            movie = {
                ...movie,
                genre: genre.split(',')
            }
            moviesWithGenres.push(movie)
        }
        return moviesWithGenres
    }

    static async getbyId({id}){
        const [movies] = await connection.query(
            'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate '+
            'FROM movie '+
            'WHERE id = UUID_TO_BIN(?);',
            [id]
        )
        if (movies.length === 0) return null
        return movies[0]
    }

    static async create({input}){
        const {
            genre: genreInput,
            title,
            year,
            duration,
            director,
            rate,
            poster
        } = input
        if(genreInput.length !== 0){
            let lowerCaseGenres = []
            for(const index in genreInput){
                lowerCaseGenres.push(genreInput[index].toLowerCase())
            }
            const [genres] = await connection.query(
                'SELECT id, name FROM genre WHERE LOWER(name) IN (?);', [lowerCaseGenres]
            )
        }
        const [uuidResult] = await connection.query('SELECT UUID() uuid;')
        const [{ uuid }] = uuidResult
        try {
            await connection.query(
                `INSERT INTO movie (id, title, year, director, duration, poster, rate)
                VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
                [title, year, director, duration, poster, rate]
            )
        } catch (e) {
            // puede enviarle información sensible
            throw new Error('Error creating movie')
            // enviar la traza a un servicio interno
            // sendLog(e)
        }
        if(genres.length !== 0){
            try {
                for(const index in genres){
                    await connection.query(
                        `INSERT INTO movies_genres(movie_id, genre_id)
                        VALUES (UUID_TO_BIN("${uuid}"), ?);`,
                        [genres[index].id]
                    )
                }
            } catch (e) {
                // puede enviarle información sensible
                throw new Error('Error creating movie genre')
                // enviar la traza a un servicio interno
                // sendLog(e)
            }
        }
        const [movies] = await connection.query(
            'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate '+
            'FROM movie WHERE id = UUID_TO_BIN(?);',
            [uuid]
        )

        return movies[0]
    }

    static async delete({id}){
    }

    static async update({id, input}){
    }
}
