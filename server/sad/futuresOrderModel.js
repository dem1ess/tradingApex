const { v4: uuidv4 } = require('uuid')
const pgp = require('pg-promise')()
require('dotenv').config()

const db = pgp(process.env.DATABASE_URL)
const { getOpenPositions } = require('../models/positionsModel')
// const { updateUserBalance, getUserBalance } = require('./balanceModel')
// const { addPosition, removePosition } = require('../models/positionsModel')
// const { getCurrentPrice } = require('../utils/priceUtils')

// Создание таблицы ордеров
const createFuturesOrdersTable = async () => {
	try {
		await db.none(`
      CREATE TABLE IF NOT EXISTS futures_orders (
        order_id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        quantity DECIMAL(18, 8) NOT NULL,
        price DECIMAL(18, 8),
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        leverage DECIMAL(10, 2) NOT NULL,
				stop_price DECIMAL(18, 8), -- Добавляем столбец stop_price, если нужно для стоп-ордеров
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
		console.log('Table futures_orders created successfully')
	} catch (error) {
		console.error('Error creating table futures_orders:', error.message)
		throw new Error('Error creating table futures_orders')
	}
}

createFuturesOrdersTable()

const calculateMarginLevel = positions => {
	// Пример функции для расчета маржинального уровня
	let totalValue = 0
	let totalMargin = 0

	for (const pos of positions) {
		totalValue += pos.quantity * pos.price // Пример расчета стоимости
		totalMargin += pos.quantity * pos.price * (1 - 1 / pos.leverage) // Пример расчета маржи
	}

	return totalValue / totalMargin
}

const checkMarginLevel = async userId => {
	try {
		console.log(`Checking margin level for user ID: ${userId}`)
		const openPositions = await getOpenPositions(userId)
		console.log(`Open positions for user ID ${userId}:`, openPositions)

		let totalMargin = 0
		for (const position of openPositions) {
			const { quantity, price, leverage } = position
			console.log(`Processing position:`, position)

			// Проверка корректности данных
			if (quantity <= 0 || price <= 0 || leverage <= 0) {
				throw new Error('Invalid position data')
			}

			const margin = (quantity * price) / leverage
			console.log(
				`Calculated margin for position: quantity=${quantity}, price=${price}, leverage=${leverage}, margin=${margin}`
			)
			totalMargin += margin
		}

		console.log(`Total margin before additional expenses: ${totalMargin}`)

		// Учет дополнительных расходов и маржи
		const additionalExpenses = 0 // Например, комиссии и сборы
		console.log(`Additional expenses: ${additionalExpenses}`)

		const effectiveMargin = totalMargin - additionalExpenses
		console.log(
			`Effective margin after additional expenses: ${effectiveMargin}`
		)

		return effectiveMargin
	} catch (error) {
		console.error('Error checking margin level:', error.message)
		throw new Error('Error checking margin level')
	}
}

const getOrdersForSymbol = async symbol => {
	try {
		const orders = await db.any(
			'SELECT * FROM futures_orders WHERE symbol = $1 AND status = $2',
			[symbol, 'open']
		)
		return orders
	} catch (error) {
		console.error('Error getting orders for symbol:', error.message)
		throw new Error('Error getting orders for symbol')
	}
}

// Размещение ордера
const placeFuturesOrder = async order => {
	const { symbol, side, quantity, price, userId } = order

	try {
		await db.none(
			'INSERT INTO futures_orders (symbol, side, quantity, price, user_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
			[symbol, side, quantity, price, userId, 'open'] // Статус по умолчанию 'open'
		)
	} catch (error) {
		console.error('Error placing futures order:', error.message)
		throw new Error('Error placing futures order')
	}
}
// Обновление статуса ордера

const getFuturesOrdersByUser = async userId => {
	try {
		return await db.any(`SELECT * FROM futures_orders WHERE user_id = $1`, [
			userId,
		])
	} catch (error) {
		console.error('Error getting futures orders by user:', error.message)
		throw new Error('Error getting futures orders by user')
	}
}
const updateFuturesOrderStatus = async (orderId, status) => {
	try {
		await db.none(`UPDATE futures_orders SET status = $1 WHERE order_id = $2`, [
			status,
			orderId,
		])
	} catch (error) {
		console.error('Error updating futures order status:', error.message)
		throw new Error('Error updating futures order status')
	}
}

module.exports = {
	placeFuturesOrder,
	getOrdersForSymbol,
	updateFuturesOrderStatus,
	calculateMarginLevel,
	checkMarginLevel,
	getFuturesOrdersByUser,
}
