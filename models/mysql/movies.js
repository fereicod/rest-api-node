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
        const result = await connection.query(
            'SELECT BIN_TO_UUID(id) id, title, year, director, duration, rate FROM movie;'
        )
        console.log(result)
    }

    static async getbyId({id}){
    }

    static async create({input}){
    }

    static async delete({id}){
    }

    static async update({id, input}){
    }
}
