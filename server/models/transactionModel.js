const db = require('../utils/db')
const { v4: uuidv4 } = require('uuid')

async function createTransactionsTable() {
	try {
		await db.none(`
            CREATE TABLE IF NOT EXISTS transactions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(10) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                crypto_wallet VARCHAR(255),
                wallet_ticker VARCHAR(10) NOT NULL, -- Новое поле для хранения тикера кошелька
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `)
		console.log('Table "transactions" created successfully')
	} catch (error) {
		console.error('Error creating "transactions" table:', error)
	}
}

createTransactionsTable()

async function createTransaction(
	userId,
	type,
	amount,
	cryptoWallet,
	walletTicker
) {
	const numericAmount = parseFloat(amount).toFixed(2)
	const transactionId = uuidv4()

	try {
		await db.none(
			`INSERT INTO transactions (id, user_id, type, amount, crypto_wallet, wallet_ticker, status) 
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
			[transactionId, userId, type, numericAmount, cryptoWallet, walletTicker]
		)
		return transactionId
	} catch (error) {
		console.error('Error creating transaction:', error.message)
		throw error
	}
}

async function updateTransactionStatus(transactionId, status) {
	await db.none(
		`UPDATE transactions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
		[status, transactionId]
	)
}

async function updateTransactionCryptoWallet(transactionId, newCryptoWallet) {
	await db.none(
		`UPDATE transactions SET crypto_wallet = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
		[newCryptoWallet, transactionId]
	)
}

async function getTransaction(transactionId) {
	return await db.oneOrNone(`SELECT * FROM transactions WHERE id = $1`, [
		transactionId,
	])
}

async function getTransactionByUser(userId) {
	return await db.any(
		`SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
		[userId]
	)
}

async function getAllTransactions() {
	return await db.any(`SELECT * FROM transactions ORDER BY created_at DESC`)
}

module.exports = {
	createTransaction,
	updateTransactionStatus,
	updateTransactionCryptoWallet,
	getTransaction,
	getTransactionByUser,
	getAllTransactions,
}
