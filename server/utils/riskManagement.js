const db = require('../utils/db')

// Get maximum risk allowed for a user
async function getMaxRisk(userId) {
	const result = await db.oneOrNone(
		'SELECT max_risk FROM users WHERE id = $1',
		[userId]
	)
	return result ? result.max_risk : 0
}

// Check if risk is within the allowable limit
async function checkRisk(userId, symbol, quantity, price) {
	try {
		const positions = await db.any(
			`SELECT entry_price, quantity FROM futures_positions WHERE user_id = $1 AND symbol = $2 AND status = 'open'`,
			[userId, symbol]
		)

		if (positions.length > 0) {
			let totalRisk = 0
			for (const position of positions) {
				const risk = Math.abs(price - position.entry_price) * position.quantity
				totalRisk += risk
			}

			const maxRisk = await getMaxRisk(userId)
			return totalRisk <= maxRisk
		}

		return true
	} catch (error) {
		console.error('Error checking risk:', error.message)
		throw error
	}
}

module.exports = {
	getMaxRisk,
	checkRisk,
}
