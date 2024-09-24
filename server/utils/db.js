// db.js
const pgp = require('pg-promise')()
require('dotenv').config() // Подключаем переменные среды из .env

const db = pgp(process.env.DATABASE_URL) // Используем одно подключение

module.exports = db
 