const pgp = require('pg-promise')()
require('dotenv').config()

const db = pgp(process.env.DATABASE_URL)

// Создание таблицы позиций
const createPositionsTable = async () => {
	try {
		await db.none(`
            CREATE TABLE IF NOT EXISTS positions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                symbol VARCHAR(20) NOT NULL,
                quantity DECIMAL NOT NULL,
                price DECIMAL NOT NULL,
                leverage DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                order_id UUID NOT NULL
            )
        `)
		console.log('Table "positions" created successfully')
	} catch (error) {
		console.error('Error creating positions table:', error.message)
		throw new Error('Error creating positions table')
	}
}

createPositionsTable()

// Добавление позиции
const addPosition = async (
	userId,
	symbol,
	quantity,
	price,
	leverage,
	orderId
) => {
	try {
		await db.none(
			`
            INSERT INTO positions (user_id, symbol, quantity, price, leverage, created_at, order_id)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
        `,
			[userId, symbol, quantity, price, leverage, orderId]
		)
		console.log(
			`Position added for user ${userId}: ${leverage} ${quantity} ${symbol} at ${price}`
		)
	} catch (error) {
		console.error('Error adding position:', error.message)
		throw new Error('Error adding position')
	}
}

const getOpenPositions = async userId => {
	try {
		console.log(`Fetching open positions for user ID: ${userId}`)

		// Проверка корректности данных пользователя
		if (!userId || typeof userId !== 'number') {
			throw new Error('Invalid user ID')
		}

		const positions = await db.any(
			`
            SELECT * FROM positions
            WHERE user_id = $1
        `,
			[userId]
		)

		// Проверка наличия открытых позиций
		if (positions.length === 0) {
			console.log(`No open positions found for user ID: ${userId}`)
			return []
		}

		console.log(`Open positions for user ID ${userId}:`, positions)
		return positions
	} catch (error) {
		console.error('Error fetching open positions:', error.message)
		throw new Error('Error fetching open positions')
	}
}

const getOpenPosition = async (userId, symbol) => {
	try {
		const position = await db.oneOrNone(
			`
            SELECT * FROM positions
            WHERE user_id = $1 AND symbol = $2
        `,
			[userId, symbol]
		)
		return position
	} catch (error) {
		console.error('Error fetching open position:', error.message)
		throw new Error('Error fetching open position')
	}
}

const getOpenPositionIdByOrderId = async (userId, orderId) => {
	try {
		const position = await db.oneOrNone(
			'SELECT id FROM positions WHERE user_id = $1 AND order_id = $2',
			[userId, orderId]
		)
		return position ? position.id : null
	} catch (error) {
		console.error('Error fetching position ID:', error.message)
		throw new Error('Error fetching position ID')
	}
}

// Удаление позиции
const removePosition = async positionId => {
	try {
		await db.none('DELETE FROM positions WHERE id = $1', [positionId])
		console.log(`Position ${positionId} removed successfully`)
	} catch (error) {
		console.error('Error removing position:', error.message)
		throw new Error('Error removing position')
	}
}

module.exports = {
	createPositionsTable,
	addPosition,
	getOpenPositions,
	getOpenPosition,
	removePosition,
	getOpenPositionIdByOrderId,
}
