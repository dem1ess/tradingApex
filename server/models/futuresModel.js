const db = require('../utils/db')
const { getCurrentPrice } = require('../utils/priceUtils')

// Create futures positions table
async function createFuturesPositionTable() {
	await db.none(`
        CREATE TABLE IF NOT EXISTS futures_positions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            symbol VARCHAR(20) NOT NULL,
            quantity DECIMAL NOT NULL,
            entry_price DECIMAL NOT NULL,
            leverage DECIMAL NOT NULL,
            position_type VARCHAR(10) NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

function roundTo(num, digits) {
	const factor = Math.pow(10, digits)
	return Math.round(num * factor) / factor
}

createFuturesPositionTable()

// Open a position
async function openPosition(
	userId,
	symbol,
	quantity,
	price,
	leverage,
	positionType
) {
	const formattedQuantity = parseFloat(quantity)
	await db.none(
		`INSERT INTO futures_positions (user_id, symbol, quantity, entry_price, leverage, position_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
		[userId, symbol, formattedQuantity, price, leverage, positionType]
	)
}

// Remove a position
async function removePosition(userId, symbol, positionId) {
	return await db.none(
		`DELETE FROM futures_positions
         WHERE user_id = $1 AND symbol = $2 AND id = $3`,
		[userId, symbol, positionId]
	)
}

// Get an open position
async function getFuturesPosition(userId, symbol) {
	console.log('getFuturesPosition', userId, symbol)
	const result = await db.oneOrNone(
		`SELECT * FROM futures_positions WHERE user_id = $1 AND symbol = $2 AND status = 'open'`,
		[userId, symbol]
	)
	return result
}

// Get all open positions
async function getFuturesPositions(userId, symbol) {
	return await db.any(
		`SELECT * FROM futures_positions WHERE user_id = $1 AND symbol = $2 AND status = 'open'`,
		[userId, symbol]
	)
}

// Update position quantity
async function updatePositionQuantity(userId, symbol, positionId, newQuantity) {
	return await db.none(
		`UPDATE futures_positions
         SET quantity = $1
         WHERE user_id = $2 AND symbol = $3 AND id = $4 AND status = 'open'`,
		[newQuantity, userId, symbol, positionId]
	)
}

// Обновить статус позиции
async function updatePositionStatus(userId, symbol, positionId, status) {
	try {
		await db.none(
			`UPDATE futures_positions
					 SET status = $1
					 WHERE user_id = $2 AND symbol = $3 AND id = $4`,
			[status, userId, symbol, positionId]
		)
		console.log(`Position ${positionId} status updated to ${status}`)
	} catch (error) {
		console.error('Error updating position status:', error.message)
		throw error
	}
}

async function calculateProfitAndLoss(
	positionType,
	entryPrice,
	closePrice,
	remainingQuantity,
	leverage
) {
	try {
		const entryPriceFloat = parseFloat(entryPrice)
		const closePriceFloat = parseFloat(closePrice)
		const remainingQuantityFloat = parseFloat(remainingQuantity)
		const leverageFloat = parseFloat(leverage)

		// Расчет прибыли/убытка
		let profitLoss =
			(closePriceFloat - entryPriceFloat) *
			remainingQuantityFloat *
			leverageFloat

		// Если позиция типа 'sell', то прибыль/убыток меняется на противоположный
		if (positionType === 'sell') {
			profitLoss = -profitLoss
		}

		return profitLoss
	} catch (error) {
		console.error('Ошибка при расчете прибыли/убытка:', error.message)
		return 0
	}
}

// Close a position
async function closePosition(userId, symbol, quantity) {
	try {
		const positions = await getFuturesPositions(userId, symbol)
		let remainingQuantity = roundTo(parseFloat(quantity), 2)

		for (const position of positions) {
			const positionQuantity = roundTo(parseFloat(position.quantity), 2)
			const positionType = position.position_type
			const entryPrice = roundTo(parseFloat(position.entry_price), 2)

			if (remainingQuantity <= positionQuantity) {
				const closePrice = await getCurrentPrice(symbol)
				const roundedClosePrice = roundTo(parseFloat(closePrice), 2)
				const profitLoss = await calculateProfitAndLoss(
					positionType,
					entryPrice,
					roundedClosePrice,
					remainingQuantity,
					position.leverage
				)

				await updatePositionQuantity(
					userId,
					symbol,
					position.id,
					roundTo(positionQuantity - remainingQuantity, 2)
				)

				if (roundTo(positionQuantity - remainingQuantity, 2) === 0) {
					await updatePositionStatus(userId, symbol, position.id, 'closed')
				}

				console.log(
					`Position ${position.id} partially closed. P/L: ${profitLoss}`
				)
				remainingQuantity = 0
				break
			} else {
				const closePrice = await getCurrentPrice(symbol)
				const roundedClosePrice = roundTo(parseFloat(closePrice), 2)
				const profitLoss = await calculateProfitAndLoss(
					positionType,
					entryPrice,
					roundedClosePrice,
					positionQuantity,
					position.leverage
				)

				await removePosition(userId, symbol, position.id)

				remainingQuantity = roundTo(remainingQuantity - positionQuantity, 2)
				console.log(`Position ${position.id} fully closed. P/L: ${profitLoss}`)
			}
		}

		if (remainingQuantity > 0) {
			// Создаем новую позицию с остатком
			const entryPrice = await getCurrentPrice(symbol)
			const newPositionType = quantity > 0 ? 'buy' : 'sell'
			await openPosition(
				userId,
				symbol,
				remainingQuantity,
				entryPrice,
				1, // Или другое значение рычага
				newPositionType
			)

			console.log(
				`Remaining quantity ${remainingQuantity} created as a new position with type ${newPositionType}.`
			)
		}
	} catch (error) {
		console.error('Error closing position:', error.message)
		throw error
	}
}

module.exports = {
	createFuturesPositionTable,
	openPosition,
	calculateProfitAndLoss,
	getFuturesPosition,
	getFuturesPositions,
	updatePositionQuantity,
	removePosition,
	closePosition,
	updatePositionStatus,
}
