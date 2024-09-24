const express = require('express')
const {
	getTradeHistory,
	getTradeHistoryBySymbol,
} = require('../models/tradeHistoryModel')
const { authMiddleware } = require('../middleware/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

// Получение истории сделок для текущего пользователя
router.get('/history', authMiddleware, async (req, res) => {
	const userId = req.user.id // Предполагается, что ID пользователя хранится в req.user после аутентификации

	try {
		const trades = await getTradeHistory(userId)
		res.json(trades)
	} catch (error) {
		res.status(500).json({ error: 'Ошибка при получении истории сделок' })
	}
})

// Получение истории сделок для текущего пользователя по символу
router.get('/history/:symbol', authMiddleware, async (req, res) => {
	const userId = req.user.id // Предполагается, что ID пользователя хранится в req.user после аутентификации
	const symbol = req.params.symbol

	try {
		const trades = await getTradeHistoryBySymbol(userId, symbol)
		res.json(trades)
	} catch (error) {
		res
			.status(500)
			.json({ error: 'Ошибка при получении истории сделок для символа' })
	}
})

module.exports = router
