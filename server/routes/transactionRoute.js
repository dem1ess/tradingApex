const express = require('express')
const router = express.Router()
const {
	addPosition,
	getPosition,
	updatePosition,
} = require('../models/userPositions')
const {
	createTransaction,
	getTransaction,
	updateTransactionCryptoWallet,
	updateTransactionStatus,
	getTransactionByUser,
	getAllTransactions,
} = require('../models/transactionModel')
const {
	authMiddleware,
	adminMiddleware,
} = require('../middleware/authMiddleware')
const { updateUserWalletBalance } = require('../models/balanceModel')

router.post('/', authMiddleware, async (req, res) => {
	const { userId, type, amount, cryptoWallet, walletTicker } = req.body

	if (!userId || !type || !amount || !walletTicker) {
		return res
			.status(400)
			.json({ message: 'User ID, type, amount, and walletTicker are required' })
	}

	if (!['deposit', 'withdrawal'].includes(type)) {
		return res.status(400).json({ message: 'Invalid transaction type' })
	}

	try {
		// Create the transaction
		const transactionId = await createTransaction(
			userId,
			type,
			amount,
			cryptoWallet,
			walletTicker
		)

		res.status(200).json({
			message: 'Transaction request created successfully',
			transactionId,
		})
	} catch (error) {
		console.error('Error creating transaction request:', error.message)
		res.status(500).json({ message: 'Internal server error' })
	}
})

// Update transaction status
router.post('/:transactionId/status', adminMiddleware, async (req, res) => {
	const { transactionId } = req.params
	const { status, newCryptoWallet } = req.body

	if (!['approved', 'rejected'].includes(status)) {
		return res.status(400).json({ message: 'Invalid status' })
	}

	try {
		const transaction = await getTransaction(transactionId)

		if (!transaction) {
			return res.status(404).json({ message: 'Transaction not found' })
		}

		if (transaction.status !== 'pending') {
			return res
				.status(400)
				.json({ message: 'Transaction is already processed' })
		}

		// Update crypto wallet address if provided
		if (newCryptoWallet) {
			await updateTransactionCryptoWallet(transactionId, newCryptoWallet)
		}

		await updateTransactionStatus(transactionId, status)

		if (status === 'approved') {
			// Форматируем символ для открытия позиции
			const symbol = `${transaction.wallet_ticker}-USD`
			const quantity =
				transaction.type === 'deposit'
					? parseFloat(transaction.amount)
					: -parseFloat(transaction.amount)

			// Проверяем, существует ли уже позиция
			const existingPosition = await getPosition(transaction.user_id, symbol)

			if (existingPosition) {
				// Обновляем существующую позицию
				await updatePosition(
					transaction.user_id,
					symbol,
					parseFloat(quantity),
					'buy' // Уточните, если нужно изменить логику на 'sell' при отрицательном количестве
				)
			} else {
				// Открываем новую позицию
				await addPosition(transaction.user_id, symbol, parseFloat(quantity))
			}
		}

		res.status(200).json({ message: 'Transaction status updated successfully' })
	} catch (error) {
		console.error('Error updating transaction status:', error.message)
		res.status(500).json({ message: 'Internal server error' })
	}
})

// Get transactions by user
router.get('/user/:userId', authMiddleware, async (req, res) => {
	const { userId } = req.params

	try {
		const transactions = await getTransactionByUser(userId)

		if (transactions.length === 0) {
			return res
				.status(404)
				.json({ message: 'No transactions found for this user' })
		}

		res.status(200).json(transactions)
	} catch (error) {
		console.error('Error fetching transactions by user:', error.message)
		res.status(500).json({ message: 'Internal server error' })
	}
})

// Get all transactions (admin)
router.get('/all', adminMiddleware, async (req, res) => {
	try {
		const transactions = await getAllTransactions()

		if (transactions.length === 0) {
			return res.status(404).json({ message: 'No transactions found' })
		}

		res.status(200).json(transactions)
	} catch (error) {
		console.error('Error fetching all transactions:', error.message)
		res.status(500).json({ message: 'Internal server error' })
	}
})

module.exports = router
