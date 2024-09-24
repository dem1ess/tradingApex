const db = require('../utils/db')
const Queue = require('bull')
const Redis = require('ioredis')
const { sendPriceUpdateToPricesClients } = require('../utils/wsServer') // Импорт функции

// Настройки Redis
const redisConfig = {
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
}

const redis = new Redis(redisConfig)
const priceQueue = new Queue('priceQueue', redisConfig)

async function createPriceTable(pair) {
	try {
		const tableName = pair.replace('-', '_')

		await db.none(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        open DECIMAL NOT NULL,
        high DECIMAL NOT NULL,
        low DECIMAL NOT NULL,
        close DECIMAL NOT NULL,
        volume DECIMAL NOT NULL,
        vwap DECIMAL,
        num_trades INTEGER,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
	} catch (error) {
		throw error
	}
}

async function savePrice(symbol, priceData) {
	try {
		const {
			date,
			open,
			high,
			low,
			close,
			volume,
			vwap,
			numTrades,
			startTime,
			endTime,
		} = priceData

		console.log(symbol, priceData)
		const tableName = symbol.replace('-', '_')

		const existingPrice = await db.oneOrNone(
			`SELECT * FROM "${tableName}" WHERE date = $1`,
			[date]
		)

		if (existingPrice) {
			await db.none(
				`UPDATE "${tableName}" SET
          open = $1, high = $2, low = $3, close = $4, volume = $5,
          vwap = $6, num_trades = $7, start_time = $8, end_time = $9
          WHERE date = $10`,
				[
					open,
					high,
					low,
					close,
					volume,
					vwap,
					numTrades,
					startTime,
					endTime,
					date,
				]
			)
		} else {
			await db.none(
				`INSERT INTO "${tableName}"
          (date, open, high, low, close, volume, vwap, num_trades, start_time, end_time)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
				[
					date,
					open,
					high,
					low,
					close,
					volume,
					vwap || null,
					numTrades || null,
					startTime || null,
					endTime || null,
				]
			)
		}

		console.log(
			`Цена для ${symbol} на ${date} успешно сохранена/обновлена в таблицу ${tableName}`
		)

		// Отправка обновления через WebSocket
		await sendPriceUpdateToPricesClients(symbol, priceData) // Отправка данных клиентам
	} catch (error) {
		console.error(
			`Ошибка при сохранении цены для ${symbol} в базу данных:`,
			error.message,
			error.stack
		)
		throw new Error('Error saving price to the database')
	}
}

// Обработчик очереди
priceQueue.process(async (job, done) => {
	try {
		console.log('Processing job:', job.data)

		// Преобразуем date в объект Date
		job.data.date = new Date(job.data.date)

		await savePrice(job.data.symbol, job.data)
		done()
	} catch (error) {
		console.error('Error processing job:', error.message, error.stack)
		done(error)
	}
})

// Обработчик ошибок Redis
redis.on('error', error => {
	console.error('Redis error:', error)
})

module.exports = {
	createPriceTable,
	savePrice,
}
