// priceModel.js
const db = require('../utils/db') // Импортируем один экземпляр подключения

// Ваш код, использующий db

async function getUserBalance(userId) {
	const result = await db.oneOrNone(
		'SELECT main_balance FROM users WHERE id = $1',
		[userId]
	)
	return result ? result.main_balance : 0
}

async function updateUserBalance(userId, amount) {
	await db.none(
		'UPDATE users SET main_balance = main_balance + $1 WHERE id = $2',
		[amount, userId]
	)
}

async function getUserCreditBalance(userId) {
	const result = await db.oneOrNone(
		'SELECT credit_balance FROM users WHERE id = $1',
		[userId]
	)
	return result ? result.credit_balance : 0
}

async function updateUserCreditBalance(userId, amount) {
	await db.none(
		'UPDATE users SET credit_balance = credit_balance + $1 WHERE id = $2',
		[amount, userId]
	)
}
async function updateUserWalletBalance(userId, walletTicker, amount) {
	try {
		// Получаем кошельки пользователя
		const user = await db.oneOrNone('SELECT wallets FROM users WHERE id = $1', [
			userId,
		])

		if (!user || !user.wallets || !user.wallets[walletTicker]) {
			throw new Error('Invalid wallet or wallet not found for user')
		}

		// Обновляем баланс кошелька
		user.wallets[walletTicker].amount += amount

		// Сохраняем обновленные кошельки в базу данных
		await db.none('UPDATE users SET wallets = $1 WHERE id = $2', [
			user.wallets,
			userId,
		])
	} catch (error) {
		console.error('Error updating wallet balance:', error.message)
		throw error
	}
}

module.exports = {
	getUserBalance,
	updateUserBalance,
	getUserCreditBalance,
	updateUserCreditBalance,
	updateUserWalletBalance, // Экспортируем новую функцию
}
