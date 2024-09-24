const db = require('../utils/db')

const createUserPositionsTable = async () => {
	try {
		await db.none(`
            CREATE TABLE IF NOT EXISTS user_positions (
                user_id INTEGER REFERENCES users(id),
                symbol VARCHAR(50),
                quantity DECIMAL(18, 8) NOT NULL,
                PRIMARY KEY (user_id, symbol)
            );
        `)
		console.log('Таблица user_positions успешно создана')
	} catch (error) {
		console.error('Ошибка при создании таблицы user_positions:', error.message)
		throw new Error('Ошибка при создании таблицы user_positions')
	}
}

createUserPositionsTable()

// Добавление новой позиции
async function addPosition(userId, symbol, quantity) {
	try {
		await db.none(
			`INSERT INTO user_positions (user_id, symbol, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, symbol) 
             DO UPDATE SET quantity = user_positions.quantity + EXCLUDED.quantity`,
			[userId, symbol, quantity]
		)
		console.log(
			`Позиция для пользователя ${userId} по символу ${symbol} успешно добавлена/обновлена addPosition`
		)
	} catch (error) {
		console.error('Ошибка при добавлении/обновлении позиции:', error.message)
		throw new Error('Ошибка при добавлении/обновлении позиции')
	}
}

// Получение позиции пользователя по символу
async function getPosition(userId, symbol) {
	try {
		return await db.oneOrNone(
			`SELECT * FROM user_positions WHERE user_id = $1 AND symbol = $2`,
			[userId, symbol]
		)
	} catch (error) {
		console.error('Ошибка при получении позиции:', error.message)
		throw new Error('Ошибка при получении позиции')
	}
}
async function getPositions(userId) {
	try {
		return await db.any(`SELECT * FROM user_positions WHERE user_id = $1`, [
			userId,
		])
	} catch (error) {
		console.error('Ошибка при получении позициий:', error.message)
		throw new Error('Ошибка при получении позициий')
	}
}

// Обновление позиции
async function updatePosition(userId, symbol, quantity, operationType) {
	try {
		// Определяем операцию (покупка или продажа)
		const adjustment = operationType === 'buy' ? quantity : -quantity

		// Выполняем обновление количества
		await db.none(
			`UPDATE user_positions 
			 SET quantity = quantity + $1 
			 WHERE user_id = $2 AND symbol = $3`,
			[adjustment, userId, symbol]
		)

		console.log(
			`Позиция для пользователя ${userId} по символу ${symbol} успешно обновлена. Операция: ${operationType}.`
		)
	} catch (error) {
		console.error('Ошибка при обновлении позиции:', error.message)
		throw new Error('Ошибка при обновлении позиции')
	}
}
// Удаление позиции
async function removePosition(userId, symbol) {
	try {
		await db.none(
			`DELETE FROM user_positions WHERE user_id = $1 AND symbol = $2`,
			[userId, symbol]
		)
		console.log(
			`Позиция для пользователя ${userId} по символу ${symbol} успешно удалена addPosition`
		)
	} catch (error) {
		console.error('Ошибка при удалении позиции:', error.message)
		throw new Error('Ошибка при удалении позиции')
	}
}

module.exports = {
	addPosition,
	getPosition,
	getPositions,
	updatePosition,
	removePosition,
}
