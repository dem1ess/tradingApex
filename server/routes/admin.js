const db = require('../utils/db')

const express = require('express')
const {
	banUser,
	updateMainBalance,
	addCreditBalance,
	getAllUsers,
	updateUser,
} = require('../controllers/adminController')
const { setPriceAdjustment } = require('../models/priceAdjustmentModel')
const {
	authMiddleware,
	adminMiddleware,
} = require('../middleware/authMiddleware')
const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.put('/ban/:userId', banUser)
router.put('/update-user/:userId', updateUser)

router.put('/main-balance/:userId', updateMainBalance)
router.put('/credit-balance/:userId', addCreditBalance)
router.get('/get-all-users', getAllUsers)

router.post('/set-price-adjustment', async (req, res) => {
	const { symbol, adjustment } = req.body

	if (typeof symbol !== 'string' || typeof adjustment !== 'number') {
		return res.status(400).json({ error: 'Invalid input' })
	}

	try {
		await setPriceAdjustment(symbol, adjustment)
		res.status(200).json({ message: 'Price adjustment set successfully' })
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

router.get('/price-adjustments', async (req, res) => {
	try {
		const adjustments = await db.any('SELECT * FROM price_adjustments')
		res.status(200).json(adjustments)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})

module.exports = router
