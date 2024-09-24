const db = require('../utils/db')

const futuresOrderModel = require('../models/futuresOrderModel')
const futuresModel = require('../models/futuresModel')
const tradeHistoryModel = require('../models/tradeHistoryModel')
const { updateUserBalance } = require('../models/balanceModel')
const { getCurrentPrice } = require('../utils/priceUtils')

function roundTo(num, digits) {
	const factor = Math.pow(10, digits)
	return Math.round(num * factor) / factor
}

async function matchOrders() {
	try {
		const orders = await db.any(
			'SELECT * FROM futures_orders WHERE status = $1',
			['pending']
		)
		const fulfilledOrders = []

		for (const order of orders) {
			const latestPrice = await getCurrentPrice(order.symbol)
			if (!latestPrice) {
				console.error(`No current price for ${order.symbol}`)
				continue
			}

			switch (order.order_type) {
				case 'market':
					await handleMarketOrder(order, latestPrice, fulfilledOrders)
					break
				case 'limit':
					await handleLimitOrder(order, latestPrice, fulfilledOrders)
					break
				case 'stop':
					await handleStopOrder(order, latestPrice, fulfilledOrders)
					break
				case 'stop-limit':
					await handleStopLimitOrder(order, latestPrice, fulfilledOrders)
					break
				case 'trailing-stop':
					await handleTrailingStopOrder(order, latestPrice, fulfilledOrders)
					break
				default:
					console.error(`Unknown order type ${order.order_type}`)
			}
		}

		return fulfilledOrders
	} catch (error) {
		console.error('Error matching orders:', error.message)
		throw new Error('Error matching orders')
	}
}

async function handleOrder(order, latestPrice, fulfilledOrders, condition) {
	try {
		if (condition) {
			const quantity = parseFloat(order.quantity)
			const existingPosition = await futuresModel.getFuturesPosition(
				order.user_id,
				order.symbol
			)

			if (existingPosition) {
				const existingQuantity = parseFloat(existingPosition.quantity)

				if (
					existingPosition.position_type === 'buy' &&
					order.order_action === 'sell'
				) {
					// Замещение позиции покупки на продажу
					if (quantity >= existingQuantity) {
						// Закрытие существующей позиции и открытие новой с остатком
						const closePrice = latestPrice
						const profitLoss = await futuresModel.calculateProfitAndLoss(
							existingPosition.position_type,
							existingPosition.entry_price,
							closePrice,
							existingQuantity,
							existingPosition.leverage
						)

						await futuresModel.closePosition(
							order.user_id,
							order.symbol,
							existingQuantity
						)

						await tradeHistoryModel.recordTrade(
							order.user_id,
							order.symbol,
							null,
							existingPosition.position_type,
							existingQuantity,
							closePrice,
							profitLoss
						)

						await updateUserBalance(order.user_id, profitLoss)

						const remainingQuantity = roundTo(quantity - existingQuantity, 10)

						if (remainingQuantity > 0) {
							await futuresModel.openPosition(
								order.user_id,
								order.symbol,
								remainingQuantity,
								latestPrice,
								order.leverage || 1,
								'sell'
							)
							console.log(
								`Opened new sell position with quantity ${remainingQuantity}`
							)
						}
					} else {
						// Частичное закрытие существующей позиции
						const newQuantity = roundTo(existingQuantity - quantity, 10)
						const closePrice = latestPrice
						const profitLoss = await futuresModel.calculateProfitAndLoss(
							existingPosition.position_type,
							existingPosition.entry_price,
							closePrice,
							quantity,
							existingPosition.leverage
						)

						await futuresModel.updatePositionQuantity(
							order.user_id,
							order.symbol,
							existingPosition.id,
							newQuantity
						)

						await tradeHistoryModel.recordTrade(
							order.user_id,
							order.symbol,
							null,
							existingPosition.position_type,
							quantity,
							closePrice,
							profitLoss
						)

						await updateUserBalance(order.user_id, profitLoss)
						console.log(`Position updated for ${order.symbol}`)
					}
				} else if (
					existingPosition.position_type === 'sell' &&
					order.order_action === 'buy'
				) {
					// Замещение позиции продажи на покупку
					if (quantity >= existingQuantity) {
						// Закрытие существующей позиции и открытие новой с остатком
						const closePrice = latestPrice
						const profitLoss = await futuresModel.calculateProfitAndLoss(
							existingPosition.position_type,
							existingPosition.entry_price,
							closePrice,
							existingQuantity,
							existingPosition.leverage
						)

						await futuresModel.closePosition(
							order.user_id,
							order.symbol,
							existingQuantity
						)

						await tradeHistoryModel.recordTrade(
							order.user_id,
							order.symbol,
							null,
							existingPosition.position_type,
							existingQuantity,
							closePrice,
							profitLoss
						)

						await updateUserBalance(order.user_id, profitLoss)

						const remainingQuantity = roundTo(quantity - existingQuantity, 10)

						if (remainingQuantity > 0) {
							await futuresModel.openPosition(
								order.user_id,
								order.symbol,
								remainingQuantity,
								latestPrice,
								order.leverage || 1,
								'buy'
							)
							console.log(
								`Opened new buy position with quantity ${remainingQuantity}`
							)
						}
					} else {
						// Частичное закрытие существующей позиции
						const newQuantity = roundTo(existingQuantity - quantity, 10)
						const closePrice = latestPrice
						const profitLoss = await futuresModel.calculateProfitAndLoss(
							existingPosition.position_type,
							existingPosition.entry_price,
							closePrice,
							quantity,
							existingPosition.leverage
						)

						await futuresModel.updatePositionQuantity(
							order.user_id,
							order.symbol,
							existingPosition.id,
							newQuantity
						)

						await tradeHistoryModel.recordTrade(
							order.user_id,
							order.symbol,
							null,
							existingPosition.position_type,
							quantity,
							closePrice,
							profitLoss
						)

						await updateUserBalance(order.user_id, profitLoss)
						console.log(`Position updated for ${order.symbol}`)
					}
				} else {
					// Обновите позицию, если тип совпадает
					const newQuantity = roundTo(existingQuantity + quantity, 10)
					await futuresModel.updatePositionQuantity(
						order.user_id,
						order.symbol,
						existingPosition.id,
						newQuantity
					)
					console.log(`Position updated for ${order.symbol}`)
				}
			} else {
				// Создайте новую позицию, если её нет
				const positionType = order.order_action === 'buy' ? 'buy' : 'sell'
				const entryPrice = latestPrice

				await futuresModel.openPosition(
					order.user_id,
					order.symbol,
					quantity,
					entryPrice,
					order.leverage || 1,
					positionType
				)

				console.log(`New position created for ${order.symbol}`)
			}

			await futuresOrderModel.updateOrderStatus(order.id, 'fulfilled')
			console.log(`${order.order_type} order ${order.id} fulfilled`)
		}
	} catch (error) {
		console.error(
			`Error handling ${order.order_type} order ${order.id}:`,
			error.message
		)
	}
}

async function handleMarketOrder(order, latestPrice, fulfilledOrders) {
	await handleOrder(order, latestPrice, fulfilledOrders, true)
}

async function handleLimitOrder(order, latestPrice, fulfilledOrders) {
	const condition =
		(order.order_action === 'buy' && latestPrice <= order.price) ||
		(order.order_action === 'sell' && latestPrice >= order.price)
	await handleOrder(order, latestPrice, fulfilledOrders, condition)
}

async function handleStopOrder(order, latestPrice, fulfilledOrders) {
	const condition =
		(order.order_action === 'buy' && latestPrice >= order.stop_price) ||
		(order.order_action === 'sell' && latestPrice <= order.stop_price)
	await handleOrder(order, latestPrice, fulfilledOrders, condition)
}

async function handleStopLimitOrder(order, latestPrice, fulfilledOrders) {
	const condition =
		(order.order_action === 'buy' &&
			latestPrice >= order.stop_price &&
			latestPrice <= order.price) ||
		(order.order_action === 'sell' &&
			latestPrice <= order.stop_price &&
			latestPrice >= order.price)
	await handleOrder(order, latestPrice, fulfilledOrders, condition)
}

async function handleTrailingStopOrder(order, latestPrice, fulfilledOrders) {
	const trailingStopPrice =
		order.price - order.price * (order.trailing_stop_percent / 100)
	const condition =
		(order.order_action === 'buy' && latestPrice >= trailingStopPrice) ||
		(order.order_action === 'sell' && latestPrice <= trailingStopPrice)
	await handleOrder(order, latestPrice, fulfilledOrders, condition)
}

async function periodicOrderProcessing() {
	try {
		await matchOrders()
		// console.log('Обработка ордеров завершена')
	} catch (error) {
		console.error('Ошибка при обработке ордеров:', error)
	}

	setTimeout(periodicOrderProcessing, 1000) // Интервал в миллисекундах (например, 5000ms = 5s)
}

periodicOrderProcessing()

module.exports = {
	matchOrders,
}
