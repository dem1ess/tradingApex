const db = require('../utils/db')
const createFuturesOrdersTable = async () => {
	await db.none(`
		CREATE TABLE IF NOT EXISTS futures_orders (
		id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    order_type VARCHAR(10) NOT NULL,
    order_action VARCHAR(10) NOT NULL,
   	quantity DECIMAL NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    leverage DECIMAL(5, 2) NOT NULL,
    stop_price DECIMAL(18, 8),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
	`)
}

createFuturesOrdersTable()
async function createOrder(
	userId,
	symbol,
	orderType,
	orderAction,
	quantity,
	price,
	leverage,
	stopPrice
) {
	// Форматирование значений
	const formattedQuantity = parseFloat(quantity)

	console.log('Creating order with values:', {
		userId,
		symbol,
		orderType,
		orderAction,
		quantity: formattedQuantity,
		price,
		leverage,
		stopPrice,
	})

	try {
		await db.none(
			`
					INSERT INTO futures_orders (user_id, symbol, order_type, order_action, quantity, price, leverage, stop_price, status)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
					`,
			[
				userId,
				symbol,
				orderType,
				orderAction,
				formattedQuantity,
				price,
				leverage,
				stopPrice,
			]
		)
		console.log('Order created successfully')
	} catch (error) {
		console.error('Error creating order:', error.message)
		throw error
	}
}

async function updateOrderStatus(orderId, status) {
	try {
		await db.none(`UPDATE futures_orders SET status = $1 WHERE id = $2`, [
			status,
			orderId,
		])
		console.log(`Order status updated to ${status} for order ${orderId}`)
	} catch (error) {
		console.error('Error updating order status:', error.message)
		throw error
	}
}

module.exports = {
	updateOrderStatus,
	createOrder,
}
