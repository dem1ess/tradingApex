const db = require('../utils/db')

// Создание таблицы для истории сделок
async function createTradeHistoryTable() {
	await db.none(`
        CREATE TABLE IF NOT EXISTS trade_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            symbol VARCHAR(20) NOT NULL,
            order_id INTEGER,
            trade_action VARCHAR(10) NOT NULL,
            quantity DECIMAL NOT NULL,
            price DECIMAL NOT NULL,
            profit_loss DECIMAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

createTradeHistoryTable()

// Запись сделки в историю
async function recordTrade(
	userId,
	symbol,
	orderId,
	tradeAction,
	quantity,
	price,
	profitLoss
) {
	await db.none(
		`INSERT INTO trade_history (user_id, symbol, order_id, trade_action, quantity, price, profit_loss)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		[userId, symbol, orderId, tradeAction, quantity, price, profitLoss]
	)
}

// Получение истории сделок для конкретного пользователя
async function getTradeHistory(userId) {
	try {
		return await db.any(
			`SELECT * FROM trade_history WHERE user_id = $1 ORDER BY created_at DESC`,
			[userId]
		)
	} catch (error) {
		console.error('Ошибка при получении истории сделок:', error.message)
		throw new Error('Error retrieving trade history')
	}
}

// Получение истории сделок для конкретного пользователя и символа
async function getTradeHistoryBySymbol(userId, symbol) {
	try {
		return await db.any(
			`SELECT * FROM trade_history WHERE user_id = $1 AND symbol = $2 ORDER BY created_at DESC`,
			[userId, symbol]
		)
	} catch (error) {
		console.error(
			'Ошибка при получении истории сделок для символа:',
			error.message
		)
		throw new Error('Error retrieving trade history by symbol')
	}
}

module.exports = {
	createTradeHistoryTable,
	recordTrade,
	getTradeHistory,
	getTradeHistoryBySymbol,
}
