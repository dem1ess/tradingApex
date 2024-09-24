const { v4: uuidv4 } = require('uuid')
const db = require('../utils/db')
const { getUserBalance, updateUserBalance } = require('../models/balanceModel')
const {
	addPosition,
	getPosition,
	updatePosition,
	removePosition,
} = require('../models/userPositions')
const { getCurrentPrice } = require('../utils/priceUtils')
const {
	updateSpotOrderStatus,
	placeSpotOrder,
} = require('../models/spotOrderModel')

const getLastKnownPrice = async symbol => {
	try {
		const tableName = symbol.replace('-', '_')
		// Получаем последнюю цену из базы данных
		const result = await db.oneOrNone(`
            SELECT close 
            FROM "${tableName}" 
            ORDER BY date DESC 
            LIMIT 1
        `)

		// Проверяем результат и возвращаем цену
		console.log('result', result)
		return result
	} catch (error) {
		console.error(
			`Error getting last known price for ${symbol}:`,
			error.message
		)
		throw new Error('Не удалось получить последнюю цену')
	}
}

const processOrder = async order => {
	const { order_id, symbol, side, quantity, price, user_id, type, stop_price } =
		order

	try {
		let currentPrice = await getCurrentPrice(symbol)

		if (type === 'market' && !currentPrice) {
			currentPrice = await getLastKnownPrice(symbol)
			if (!currentPrice) {
				console.log(`Цена недоступна для ордера ${order_id}`)
				return
			}
		}

		// Проверяем формат quantity и price
		const formattedQuantity = parseFloat(quantity).toFixed(8)
		const formattedPrice = price ? parseFloat(price) : null

		if (type === 'market') {
			if (side === 'buy') {
				const userBalance = await getUserBalance(user_id)
				const totalCost = formattedQuantity * currentPrice

				if (totalCost > userBalance) {
					throw new Error(
						'Недостаточно средств для выполнения ордера на покупку'
					)
				}

				const existingPosition = await getPosition(user_id, symbol)
				if (existingPosition) {
					await updatePosition(
						user_id,
						symbol,
						parseFloat(formattedQuantity),
						'buy'
					)
				} else {
					await addPosition(user_id, symbol, parseFloat(formattedQuantity))
				}

				await updateUserBalance(user_id, -totalCost)
				await updateSpotOrderStatus(order_id, 'closed', currentPrice)

				console.log(
					`Пользователь ${user_id} успешно купил ${formattedQuantity} ${symbol} по рыночной цене ${currentPrice}`
				)
			} else if (side === 'sell') {
				const position = await getPosition(user_id, symbol)
				if (!position || position.quantity < parseFloat(formattedQuantity)) {
					throw new Error(
						'Недостаточно активов для выполнения ордера на продажу'
					)
				}

				const newQuantity = position.quantity - parseFloat(formattedQuantity)
				if (newQuantity > 0) {
					await updatePosition(user_id, symbol, newQuantity, 'sell')
				} else {
					await removePosition(user_id, symbol)
				}

				const totalRevenue = parseFloat(formattedQuantity) * currentPrice
				await updateUserBalance(user_id, totalRevenue)
				await updateSpotOrderStatus(order_id, 'closed', currentPrice)

				console.log(
					`Пользователь ${user_id} успешно продал ${formattedQuantity} ${symbol} по рыночной цене ${currentPrice}`
				)
			} else {
				console.log(
					`Ордер ${order_id} не может быть исполнен по рыночной цене ${currentPrice}`
				)
				await updateSpotOrderStatus(order_id, 'cancelled')
			}
		} else if (type === 'limit') {
			if (side === 'buy' && currentPrice <= formattedPrice) {
				const userBalance = await getUserBalance(user_id)
				const totalCost = parseFloat(formattedQuantity) * formattedPrice

				if (totalCost > userBalance) {
					throw new Error(
						'Недостаточно средств для выполнения лимитного ордера на покупку'
					)
				}

				const existingPosition = await getPosition(user_id, symbol)
				if (existingPosition) {
					await updatePosition(
						user_id,
						symbol,
						parseFloat(formattedQuantity),
						'buy'
					)
				} else {
					await addPosition(user_id, symbol, parseFloat(formattedQuantity))
				}

				await updateUserBalance(user_id, -totalCost)
				await updateSpotOrderStatus(order_id, 'closed', formattedPrice)

				console.log(
					`Пользователь ${user_id} успешно купил ${formattedQuantity} ${symbol} по лимитной цене ${formattedPrice}`
				)
			} else if (side === 'sell' && currentPrice >= formattedPrice) {
				const position = await getPosition(user_id, symbol)
				if (!position || position.quantity < parseFloat(formattedQuantity)) {
					throw new Error(
						'Недостаточно активов для выполнения лимитного ордера на продажу'
					)
				}

				const newQuantity = position.quantity - parseFloat(formattedQuantity)
				if (newQuantity > 0) {
					await updatePosition(user_id, symbol, newQuantity, 'sell')
				} else {
					await removePosition(user_id, symbol)
				}

				const totalRevenue = parseFloat(formattedQuantity) * formattedPrice
				await updateUserBalance(user_id, totalRevenue)
				await updateSpotOrderStatus(order_id, 'closed', formattedPrice)

				console.log(
					`Пользователь ${user_id} успешно продал ${formattedQuantity} ${symbol} по лимитной цене ${formattedPrice}`
				)
			} else {
				console.log(
					`Лимитный ордер ${order_id} не исполнился по текущей цене ${currentPrice}`
				)
			}
		} else if (type === 'stop-limit') {
			if (
				side === 'buy' &&
				currentPrice <= formattedPrice &&
				currentPrice >= stop_price
			) {
				const userBalance = await getUserBalance(user_id)
				const totalCost = parseFloat(formattedQuantity) * formattedPrice

				if (totalCost > userBalance) {
					throw new Error(
						'Недостаточно средств для выполнения ордера на покупку'
					)
				}

				const existingPosition = await getPosition(user_id, symbol)
				if (existingPosition) {
					await updatePosition(
						user_id,
						symbol,
						parseFloat(formattedQuantity),
						'buy'
					)
				} else {
					await addPosition(user_id, symbol, parseFloat(formattedQuantity))
				}

				await updateUserBalance(user_id, -totalCost)
				await updateSpotOrderStatus(order_id, 'closed')

				console.log(
					`Пользователь ${user_id} успешно купил ${formattedQuantity} ${symbol} по цене ${formattedPrice} в режиме стоп-лимит`
				)
			} else if (
				side === 'sell' &&
				currentPrice >= formattedPrice &&
				currentPrice <= stop_price
			) {
				const position = await getPosition(user_id, symbol)
				if (!position || position.quantity < parseFloat(formattedQuantity)) {
					throw new Error(
						'Недостаточно активов для выполнения ордера на продажу'
					)
				}

				const newQuantity = position.quantity - parseFloat(formattedQuantity)
				if (newQuantity > 0) {
					await updatePosition(user_id, symbol, newQuantity, 'sell')
				} else {
					await removePosition(user_id, symbol)
				}

				const totalRevenue = parseFloat(formattedQuantity) * currentPrice
				await updateUserBalance(user_id, totalRevenue)
				await updateSpotOrderStatus(order_id, 'closed')

				console.log(
					`Пользователь ${user_id} успешно продал ${formattedQuantity} ${symbol} по цене ${currentPrice} в режиме стоп-лимит`
				)
			} else {
				console.log(
					`Ордер ${order_id} не может быть исполнен по цене ${currentPrice}`
				)
				await updateSpotOrderStatus(order_id, 'cancelled')
			}
		}
	} catch (error) {
		console.error(`Ошибка при обработке ордера ${order_id}:`, error.message)
	}
}

const placeOrder = async order => {
	try {
		// Проверка наличия обязательных полей
		const missingFields = []
		if (!order.symbol) missingFields.push('symbol')
		if (!order.side) missingFields.push('side')
		if (!order.quantity) missingFields.push('quantity')
		if (order.type === 'limit' && !order.price) missingFields.push('price')
		if (!order.user_id) missingFields.push('user_id')
		if (!order.type) missingFields.push('type')

		if (missingFields.length > 0) {
			throw new Error(
				`Missing required fields in order: ${missingFields.join(', ')}`
			)
		}

		// Генерация уникального идентификатора ордера
		const order_id = uuidv4()

		// Форматирование числовых значений
		const quantity = parseFloat(order.quantity).toFixed(8)
		const type = order.type || 'limit'
		const side = order.side
		const user_id = order.user_id
		const symbol = order.symbol

		// Получение текущей цены
		let currentPrice = await getCurrentPrice(symbol)
		console.log('Current Price from getCurrentPrice:', currentPrice) // Добавьте это логирование

		if (type === 'market') {
			if (!currentPrice) {
				currentPrice = await getLastKnownPrice(symbol)
				if (!currentPrice) {
					throw new Error('Не удалось получить цену для ордера типа market')
				}
			}
		}

		// Цена для ордеров типа limit и stop-limit
		const price = type === 'limit' ? parseFloat(order.price).toFixed(8) : null

		// Если цена для limit или stop-limit ордера недоступна, используем последнюю известную цену
		const effectivePrice = price || (await getLastKnownPrice(symbol)) || null

		console.log('Effective Price:', effectivePrice) // Добавьте это логирование

		// Сохранение ордера в базе данных
		await placeSpotOrder({
			order_id,
			user_id,
			symbol,
			type,
			side,
			quantity,
			price: type === 'market' ? currentPrice : effectivePrice, // Используем актуальную цену для market ордера и последнюю известную для других типов
			status: 'open',
			timestamp: order.created_at || new Date().toISOString(),
		})

		// Немедленное выполнение ордера типа market
		if (type === 'market') {
			await processOrder({
				order_id,
				user_id,
				symbol,
				side,
				quantity,
				price: currentPrice,
				type: 'market',
				created_at: order.created_at || new Date().toISOString(),
			})

			// Возврат информации о новом ордере
			return {
				order_id,
				status: 'closed',
				created_at: new Date().toISOString(),
				price: currentPrice,
			}
		}

		// Для ордеров типа limit и stop-limit, просто возвращаем информацию о новом ордере
		return {
			order_id,
			status: 'open',
			created_at: new Date().toISOString(),
			price: effectivePrice,
		}
	} catch (error) {
		console.error('Ошибка при размещении ордера:', error.message)
		throw new Error('Ошибка при размещении ордера')
	}
}

module.exports = {
	placeOrder,
	processOrder,
}
