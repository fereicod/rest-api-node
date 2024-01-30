import z from 'zod';

// Definimos que tipo de valor se espera por cada campo y que tipo de respuesta de error customizado
const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required.'
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comdey', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
        {
            required_error: 'Movie genre is required.',
            invalid_type_error: 'Movie genre must be an array of enum Genre',
        }
    )
})

function validateMovie(object){
    // el parse solo valida y si hay un error hay que utilizar un try-catch
    // return movieSchema.parse(object)

    // el safeParseAsync siempre devuelve un objecto si es un error O si hay datos
    // pero lo hace asincrono para no detener el proceso mientras se valida la data
    // return movieSchema.safeParseAsync(object)

    // el safeParse siempre devuelve un objecto si es un error O si hay datos
    return movieSchema.safeParse(object)
}

function validatePartialMovie(object){
    // si utilizamos el partial(), cada field sera opcional
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}
