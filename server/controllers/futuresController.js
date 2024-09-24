const db = require('../utils/db')

const express = require('express')
const router = express.Router()
const futuresModel = require('../models/futuresModel')
const futuresOrderModel = require('../models/futuresOrderModel')
const tradeHistoryModel = require('../models/tradeHistoryModel')
const riskManagement = require('../utils/riskManagement')
const { getCurrentPrice } = require('../utils/priceUtils')
const { calculateProfitAndLoss } = require('../utils/riskManagement')
const { authMiddleware } = require('../middleware/authMiddleware')

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
			`Error getting last known price for ${symbol}:`,
			error.message
		)
		throw new Error('Unable to retrieve last known price')
	}
}

router.get('/orders', authMiddleware, async (req, res) => {
	const userId = req.user.id
	try {
		const orders = await db.any(
			`SELECT * FROM futures_orders WHERE user_id = $1`,
			[userId]
		)
		res.json(orders)
	} catch (error) {
		console.error('Error retrieving orders:', error.message)
		res.status(500).json({ error: 'Error retrieving orders' })
	}
})

router.get('/positions/:userId', async (req, res) => {
	const { userId } = req.params
	if (!userId) {
		return res.status(400).json({ error: 'Missing userId' })
	}
	try {
		const positions = await db.any(
			`SELECT * FROM futures_positions WHERE user_id = $1 AND status = 'open'`,
			[userId]
		)
		res.json(positions)
	} catch (error) {
		console.error('Error retrieving positions:', error.message)
		res.status(500).json({ error: 'Error retrieving positions' })
	}
})

router.post('/orders', async (req, res) => {
	const {
		userId,
		symbol,
		orderType,
		orderAction,
		quantity: requestedQuantity,
		price: requestedPrice,
		stopPrice,
		leverage,
	} = req.body

	const quantity = parseFloat(requestedQuantity).toFixed(8)

	try {
		let price = requestedPrice
		if (orderType === 'market' && !price) {
			price =
				(await getCurrentPrice(symbol)) || (await getLastKnownPrice(symbol))
			if (!price) {
				return res.status(400).json({ message: 'Unable to retrieve price' })
			}
		}
		if (await riskManagement.checkRisk(userId, symbol, quantity, price)) {
			await futuresOrderModel.createOrder(
				userId,
				symbol,
				orderType,
				orderAction,
				quantity,
				price,
				leverage,
				stopPrice
			)
			res.status(200).json({ message: 'Order placed successfully' })
		} else {
			res.status(400).json({ message: 'Risk limit exceeded' })
		}
	} catch (error) {
		console.error('Error placing order:', error.message)
		res.status(500).json({ error: error.message })
	}
})

router.put('/orders/:orderId/status', async (req, res) => {
	try {
		const { orderId } = req.params
		const { status } = req.body
		await futuresOrderModel.updateOrderStatus(orderId, status)
		res.json({
			message: `Future order ${orderId} status updated to ${status}`,
		})
	} catch (error) {
		res.status(500).json({
			error: error.message,
			message: 'Error updating spot order status',
		})
	}
})

// Роут для закрытия позиции
router.post('/close', authMiddleware, async (req, res) => {
	const { symbol, quantity, closePrice } = req.body
	const userId = req.user.id // Используем userId из токена

	try {
		// Получение текущей цены, если closePrice не передан
		const currentPrice = closePrice || (await getCurrentPrice(symbol))

		if (!currentPrice) {
			throw new Error('Could not retrieve the current price for the symbol')
		}

		// Закрытие позиции
		await futuresModel.closePosition(userId, symbol, quantity)

		// Получение текущей позиции для расчета прибыли/убытка
		const openPosition = await futuresModel.getFuturesPosition(userId, symbol)

		if (!openPosition) {
			throw new Error('No open position found for the user and symbol')
		}

		const entryPrice = openPosition.entry_price
		const positionType = openPosition.position_type
		const leverage = openPosition.leverage

		// Расчет прибыли/убытка
		const profitLoss = await futuresModel.calculateProfitAndLoss(
			positionType,
			entryPrice,
			currentPrice,
			quantity,
			leverage
		)

		// Запись в историю торгов
		await tradeHistoryModel.recordTrade(
			userId,
			symbol,
			null,
			'sell',
			quantity,
			currentPrice,
			profitLoss
		)

		res
			.status(200)
			.json({ message: 'Position closed successfully', profitLoss })
	} catch (error) {
		console.error('Error closing position:', error.message)
		res.status(500).json({ error: error.message })
	}
})

module.exports = {
	calculateProfitAndLoss, // Export the function directly
	router,
}
