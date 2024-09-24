const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/authMiddleware')
const {
	placeOrder,
	updateOrderStatus,
	processOrder,
} = require('../controllers/futuresController')
const { getFuturesOrdersByUser } = require('../models/futuresOrderModel')
const { getOpenPosition } = require('../models/positionsModel')

// Применяем authMiddleware ко всем роутам
router.use(authMiddleware)

// Роут для размещения нового фьючерсного ордера
router.post('/orders', async (req, res) => {
	try {
		console.log('Request user:', req.user) // Логирование для проверки
		const order = req.body

		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		order.user_id = req.user.id // Используем userId из токена

		const newOrder = await placeOrder(order)
		res.status(201).json({
			message: 'Futures order placed successfully',
			order: newOrder,
		})
	} catch (error) {
		console.error('Error placing order:', error.message) // Логирование ошибки
		res.status(500).json({ error: error.message })
	}
})

// Роут для обновления статуса фьючерсного ордера
router.put('/orders/:orderId/status', async (req, res) => {
	try {
		const { orderId } = req.params
		const { status } = req.body
		await updateOrderStatus(orderId, status)
		res.json({
			message: `Futures order ${orderId} status updated to ${status}`,
		})
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

// Роут для обработки фьючерсного ордера
router.post('/process-order', async (req, res) => {
	try {
		const order = req.body
		order.user_id = req.user.id // Используем userId из токена
		await processOrder(order)
		res.json({
			message: `Futures order ${order.order_id} processed successfully`,
		})
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

router.get('/positions', async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		const userId = req.user.id
		const symbol = req.query.symbol
		const position = await getOpenPosition(userId, symbol)
		res.json({
			position,
		})
	} catch (error) {
		console.error('Error getting futures orders by user:', error.message)
		res.status(500).json({ error: error.message })
	}
})

router.get('/orders', async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		const userId = req.user.id
		const orders = await getFuturesOrdersByUser(userId)
		res.json({
			orders,
		})
	} catch (error) {
		console.error('Error getting futures orders by user:', error.message)
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
