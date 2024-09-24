const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const createSpotOrdersTable = async () => {
	try {
		await db.none(`
            CREATE TABLE IF NOT EXISTS spot_orders (
                order_id VARCHAR(255) PRIMARY KEY,
                symbol VARCHAR(50) NOT NULL,
                side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
                quantity NUMERIC(10, 3) NOT NULL,
                price DECIMAL(18, 8) NOT NULL,
                user_id INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed', 'canceled')),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                type VARCHAR(10) NOT NULL CHECK (type IN ('limit', 'market', 'stop-limit')), -- Добавляем столбец type
                stop_price DECIMAL(18, 8), -- Добавляем столбец stop_price, если нужно для стоп-ордеров
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `)
		console.log('Table spot_orders created successfully')
	} catch (error) {
		console.error('Error creating table spot_orders:', error.message)
		throw new Error('Error creating table spot_orders')
	}
}

createSpotOrdersTable()

const getOrdersForSymbolStock = async symbol => {
	try {
		const orders = await db.any(
			'SELECT * FROM spot_orders WHERE symbol = $1 AND status = $2',
			[symbol, 'open'] // Получаем только открытые ордера
		)
		return orders
	} catch (error) {
		console.error('Error fetching orders for symbol:', error.message)
		throw new Error('Error fetching orders for symbol')
	}
}

const getSpotOrdersByUser = async userId => {
	try {
		return await db.any(`SELECT * FROM spot_orders WHERE user_id = $1`, [
			userId,
		])
	} catch (error) {
		console.error('Error getting futures orders by user:', error.message)
		throw new Error('Error getting futures orders by user')
	}
}

// Функция для размещения нового спотового ордера
const placeSpotOrder = async order => {
	const {
		order_id,
		user_id,
		symbol,
		type,
		side,
		quantity,
		price,
		status,
		timestamp,
	} = order

	// Форматирование значений
	const formattedQuantity = parseFloat(quantity).toFixed(8)

	console.log('Inserting order with values:', {
		order_id,
		user_id,
		symbol,
		type,
		side,
		quantity: formattedQuantity,
		price,
		status,
		timestamp,
	})

	await db.none(
		`INSERT INTO spot_orders (order_id, user_id, symbol, type, side, quantity, price, status, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		[
			order_id,
			user_id,
			symbol,
			type,
			side,
			formattedQuantity,
			price,
			status,
			timestamp,
		]
	)
}

// Функция для обновления статуса спотового ордера
const updateSpotOrderStatus = async (orderId, status) => {
	await db.none(`UPDATE spot_orders SET status = $1 WHERE order_id = $2`, [
		status,
		orderId,
	])
}

const deleteSpotOrder = async orderId => {
	try {
		await db.none(`DELETE FROM spot_orders WHERE order_id = $1`, [orderId])
		console.log(`Order with ID ${orderId} deleted successfully`)
	} catch (error) {
		console.error('Error deleting spot order:', error.message)
		throw new Error('Error deleting spot order')
	}
}

module.exports = {
	placeSpotOrder,
	updateSpotOrderStatus,
	getOrdersForSymbolStock,
	getSpotOrdersByUser,
	deleteSpotOrder,
}
