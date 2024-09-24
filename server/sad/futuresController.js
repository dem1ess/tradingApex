const pgp = require('pg-promise')()
require('dotenv').config()

const db = pgp(process.env.DATABASE_URL)

const {
	addPosition,
	getOpenPositions,
	removePosition,
	getOpenPositionIdByOrderId,
} = require('../models/positionsModel') // Импортируем функцию для добавления позиции
const { v4: uuidv4 } = require('uuid')
const {
	placeFuturesOrder,
	updateFuturesOrderStatus,
	getFuturesOrdersByUser,
	checkMarginLevel,
} = require('../models/futuresOrderModel')
const { getCurrentPrice } = require('../utils/priceUtils')
const {
	updateUserBalance,
	getUserBalance,
	getUserCreditBalance,
	updateUserCreditBalance,
} = require('../models/balanceModel')

const SOME_THRESHOLD = parseFloat(process.env.MARGIN_THRESHOLD) || 0.1

// Функция для размещения нового фьючерсного ордера
const placeOrder = async order => {
	try {
		const missingFields = []
		if (!order.symbol) missingFields.push('symbol')
		if (!order.side) missingFields.push('side')
		if (!order.quantity) missingFields.push('quantity')
		if (order.type === 'limit' && !order.price) missingFields.push('price')
		if (!order.user_id) missingFields.push('user_id')
		if (!order.type) missingFields.push('type')

		if (missingFields.length > 0) {
			throw new Error(
				`Missing required fields in order: ${missingFields.join(', ')}`
			)
		}

		const orderId = uuidv4()
		const balance = await getUserBalance(order.user_id)
		console.log(
			'alskdjhslkhdjfjkahsdl;fjaskljdf++++++++++++++++++++++++++++++++++++++++++++++++++++++++',
			balance
		)

		let price = parseFloat(order.price)
		const quantity = parseFloat(order.quantity)
		const leverage = parseFloat(order.leverage) || 1
		const requiredCapital = (quantity * (price || 0)) / leverage

		if (requiredCapital > balance) {
			throw new Error('Insufficient balance to place the order')
		}

		if (!price) {
			if (order.type === 'market') {
				// Получаем последнюю цену из базы данных, если ордер типа 'market'
				price = await getLastKnownPrice(order.symbol)
				if (!price) {
					throw new Error(`Unable to get last known price for ${order.symbol}`)
				}
			} else {
				// Для других типов ордеров (например, 'limit'), если цена не передана, выбрасываем ошибку
				throw new Error('Price is required for limit orders')
			}
		}

		const timestamp = order.timestamp || new Date().toISOString()

		await db.none(
			'INSERT INTO futures_orders (order_id, symbol, side, quantity, price, user_id, status, type, leverage, timestamp, stop_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
			[
				orderId,
				order.symbol,
				order.side,
				quantity,
				price,
				order.user_id,
				order.status || 'open',
				order.type || 'limit',
				leverage,
				timestamp,
				order.stop_price || null,
			]
		)

		await updateUserBalance(order.user_id, -requiredCapital)

		const newOrder = {
			...order,
			order_id: orderId,
			price, // Устанавливаем цену в новом ордере
			status: 'open',
			created_at: new Date().toISOString(),
		}

		// Обработка ордера типа 'market' немедленно
		if (order.type === 'market') {
			await processOrder(newOrder)
		}

		return newOrder
	} catch (error) {
		console.error('Error in placeOrder function:', error.message)
		throw new Error('Error placing order')
	}
}

// Функция для обновления статуса фьючерсного ордера
const updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params
		const { status } = req.body
		await updateFuturesOrderStatus(orderId, status)
		res.json({
			message: `Futures order ${orderId} status updated to ${status}`,
		})
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
}

// Функция для исполнения лимитного ордера на покупку
const liquidatePosition = async (userId, orderId) => {
	try {
		const positionId = await getOpenPositionIdByOrderId(userId, orderId)
		if (!positionId) {
			throw new Error(`Position with order_id ${orderId} not found`)
		}

		const position = await db.oneOrNone(
			'SELECT * FROM positions WHERE id = $1',
			[positionId]
		)
		if (!position) {
			throw new Error(`Position with id ${positionId} not found`)
		}

		const { symbol, quantity, price } = position

		const currentPrice = await getCurrentPrice(symbol)

		const profitOrLoss = (currentPrice - price) * quantity

		await updateUserBalance(userId, profitOrLoss)

		await db.none('DELETE FROM positions WHERE id = $1', [positionId])

		console.log(
			`Position ${positionId} for user ${userId} liquidated successfully`
		)
	} catch (error) {
		console.error('Error during liquidation process:', error.message)
		throw new Error('Error during liquidation process')
	}
}

const executeBuyOrder = async (
	orderId,
	symbol,
	quantity,
	price,
	userId,
	leverage
) => {
	try {
		console.log(
			`Executing buy order ${orderId}: symbol=${symbol}, quantity=${quantity}, price=${price}, userId=${userId}, leverage=${leverage}`
		)

		// Получение текущего баланса пользователя
		const currentBalance = await getUserBalance(userId)
		const currentCreditBalance = await getUserCreditBalance(userId)

		// Расчет стоимости позиции с учетом кредитного плеча
		const totalCost = (quantity * price) / leverage

		// Проверка, достаточно ли средств на балансе пользователя
		if (currentBalance + currentCreditBalance < totalCost) {
			throw new Error('Insufficient funds')
		}

		// Обновление баланса пользователя
		if (currentBalance >= totalCost) {
			await updateUserBalance(userId, -totalCost)
		} else {
			const remainingCost = totalCost - currentBalance
			await updateUserBalance(userId, -currentBalance)
			await updateUserCreditBalance(userId, -remainingCost)
		}

		// Добавление позиции
		await addPosition(userId, symbol, quantity, price, leverage, orderId)
		console.log(
			`User ${userId} has successfully bought ${quantity} of ${symbol} at ${price}`
		)
	} catch (error) {
		console.error('Error executing buy order:', error.message)
		throw new Error('Error executing buy order')
	}
}
const executeSellOrder = async (
	orderId,
	symbol,
	quantity,
	price,
	userId,
	leverage
) => {
	try {
		console.log(
			`Executing sell order ${orderId}: symbol=${symbol}, quantity=${quantity}, price=${price}, userId=${userId}, leverage=${leverage}`
		)

		const positionId = await getOpenPositionIdByOrderId(userId, orderId)
		if (positionId) {
			await removePosition(positionId)
			console.log(`Position ${positionId} removed successfully`)
		} else {
			console.log(`No open position found for order ${orderId} to remove.`)
			return
		}

		// Расчет заработка с учетом кредитного плеча
		const earnings = quantity * price
		const earningsWithLeverage = earnings / leverage

		// Обновление балансов пользователя
		await updateUserBalance(userId, earningsWithLeverage)
		console.log(
			`User ${userId} has successfully sold ${quantity} of ${symbol} at ${price}`
		)
	} catch (error) {
		console.error('Error executing sell order:', error.message)
		throw new Error('Error executing sell order')
	}
}

module.exports = {
	executeSellOrder,
}

const getLastKnownPrice = async symbol => {
	try {
		const tableName = symbol.replace('-', '_')
		const result = await db.oneOrNone(`
			SELECT close 
			FROM "${tableName}" 
			ORDER BY date DESC 
			LIMIT 1
		`)
		return result ? result.close : null
	} catch (error) {
		console.error(
			`Ошибка при получении последней цены для ${symbol}:`,
			error.message
		)
		throw new Error('Не удалось получить последнюю цену')
	}
}

const processOrder = async order => {
	const {
		order_id,
		symbol,
		side,
		quantity,
		price,
		user_id,
		type,
		stop_price,
		leverage,
	} = order

	console.log(order, 'Processing Order...')

	try {
		let currentPrice = price || (await getCurrentPrice(symbol))

		if (!currentPrice && type !== 'market') {
			currentPrice = await getLastKnownPrice(symbol)
			if (!currentPrice) {
				console.log(`Не удалось получить цену для ордера ${order_id}`)
				return
			}
		}

		if (type === 'market') {
			if (side === 'buy') {
				await executeBuyOrder(
					order_id,
					symbol,
					quantity,
					currentPrice,
					user_id,
					leverage
				)
			} else if (side === 'sell') {
				await executeSellOrder(
					order_id,
					symbol,
					quantity,
					currentPrice,
					user_id,
					leverage
				)
			}
		} else if (type === 'limit') {
			if (side === 'buy' && currentPrice <= price) {
				await executeBuyOrder(
					order_id,
					symbol,
					quantity,
					price,
					user_id,
					leverage
				)
			} else if (side === 'sell' && currentPrice >= price) {
				await executeSellOrder(
					order_id,
					symbol,
					quantity,
					price,
					user_id,
					leverage
				)
			} else {
				console.log(
					`Limit order ${order_id} is not executable at current price ${currentPrice}`
				)
				return
			}
		} else if (type === 'stop-limit') {
			if (side === 'buy' && currentPrice >= stop_price) {
				await executeBuyOrder(
					order_id,
					symbol,
					quantity,
					price,
					user_id,
					leverage
				)
			} else if (side === 'sell' && currentPrice <= stop_price) {
				await executeSellOrder(
					order_id,
					symbol,
					quantity,
					price,
					user_id,
					leverage
				)
			} else {
				console.log(
					`Stop-limit order ${order_id} is not executable at current price ${currentPrice}`
				)
				return
			}
		} else {
			throw new Error(`Unknown order type: ${type}`)
		}

		await updateFuturesOrderStatus(order_id, 'closed')

		const openPositions = await getOpenPositions(user_id)
		if (openPositions.length > 0) {
			const marginLevel = await checkMarginLevel(user_id)
			if (marginLevel < SOME_THRESHOLD) {
				console.log(
					marginLevel,
					'marginLevel',
					SOME_THRESHOLD,
					'SOME_THRESHOLD'
				)
				await liquidatePosition(user_id, order_id)
				console.log(`Liquidated position for user ${user_id}`)
			}
		}
	} catch (error) {
		console.error('Error processing order:', error.message)
		throw new Error('Error processing order')
	}
}

module.exports = { placeOrder, updateOrderStatus, processOrder }
