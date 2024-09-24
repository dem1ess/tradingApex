const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/authMiddleware')
const {
	placeOrder,
	processOrder,
	deleteSpotOrder,
} = require('../controllers/spotController')
const { updateSpotOrderStatus } = require('../models/spotOrderModel')
const { getPositions } = require('../models/userPositions')
const { getSpotOrdersByUser } = require('../models/spotOrderModel')

// Применяем authMiddleware ко всем роутам
router.use(authMiddleware)

// Роут для размещения нового спотового ордера
router.post('/orders', async (req, res) => {
	try {
		const order = req.body

		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		order.user_id = req.user.id // Используем userId из токена

		const newOrder = await placeOrder(order)
		res.status(201).json({
			message: 'Spot order placed successfully',
			order: newOrder,
		})
	} catch (error) {
		console.error('Error placing order:', error.message)
		res.status(500).json({ error: error.message })
	}
})

router.delete('/orders/:orderId', async (req, res) => {
	try {
		const { orderId } = req.params
		await deleteSpotOrder(orderId)
		res.json({
			message: `Spot order ${orderId} deleted successfully`,
		})
	} catch (error) {
		console.error('Error deleting spot order:', error.message)
		res.status(500).json({ error: error.message })
	}
})

router.get('/positions', authMiddleware, async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		const userId = req.user.id
		const positions = await getPositions(userId)
		res.json({
			positions,
		})
	} catch (error) {
		console.error('Error getting futures orders by user:', error.message)
		res.status(500).json({ error: error.message })
	}
})

// Роут для обновления статуса спотового ордера
router.put('/orders/:orderId/status', async (req, res) => {
	try {
		const { orderId } = req.params
		const { status } = req.body
		await updateSpotOrderStatus(orderId, status)
		res.json({
			message: `Spot order ${orderId} status updated to ${status}`,
		})
	} catch (error) {
		res.status(500).json({
			error: error.message,
			message: 'Error updating spot order status',
		})
	}
})

// Роут для обработки спотового ордера
router.post('/process-order', async (req, res) => {
	try {
		const order = req.body
		order.user_id = req.user.id // Используем userId из токена
		await processOrder(order)
		res.json({
			message: `Spot order ${order.order_id} processed successfully`,
		})
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

router.get('/orders', async (req, res) => {
	try {
		if (!req.user || !req.user.id) {
			return res.status(400).json({ error: 'User ID is missing in token' })
		}

		const userId = req.user.id
		const orders = await getSpotOrdersByUser(userId)
		res.json({
			orders,
		})
	} catch (error) {
		console.error('Error getting spot orders by user:', error.message)
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
