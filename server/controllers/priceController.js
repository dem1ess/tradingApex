const WebSocket = require('ws')
const { savePrice, createPriceTable } = require('../models/priceModel')
const { savePriceQuote } = require('../models/quoteModel')
const {
	getCurrentPrice,
	usdPairs,
	stocks,
	forexPairs,
} = require('../utils/priceUtils')
const futuresController = require('./futuresController')
const { getOrdersForSymbol } = require('../models/futuresOrderModel')
const { getOrdersForSymbolStock } = require('../models/spotOrderModel')
const { processOrder } = require('./spotController')
const Redis = require('ioredis')
const db = require('../utils/db')

const redisConfig = {
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
}
const redis = new Redis(redisConfig)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY

// Импортируем функции для работы с корректировками цен
const {
	createPriceAdjustmentTable,
	setPriceAdjustment,
} = require('../models/priceAdjustmentModel')

// Создание WebSocket соединений
const cryptoSocket = new WebSocket('wss://socket.polygon.io/crypto')
const stocksSocket = new WebSocket('wss://socket.polygon.io/stocks')
// const forexSocket = new WebSocket('wss://socket.polygon.io/forex')

// Создание таблицы price_adjustments
createPriceAdjustmentTable()

// Функция подписки на пары
const subscribePairs = async (pairsSocket, pairs, prefix) => {
	pairsSocket.on('open', async () => {
		console.log('WebSocket connection established for pairs')
		pairsSocket.send(
			JSON.stringify({ action: 'auth', params: POLYGON_API_KEY })
		)

		if (!Array.isArray(pairs)) {
			console.error(`Expected an array but received: ${typeof pairs}`)
			return
		}

		for (const pair of pairs) {
			try {
				await createPriceTable(pair)
				console.log(`Created table for pair: ${pair}`)
				pairsSocket.send(
					JSON.stringify({ action: 'subscribe', params: `${prefix}.${pair}` })
				)
				console.log(`Subscribed to pair: ${pair}`)
			} catch (error) {
				console.error(
					`Error creating table or subscribing to pair ${pair}: ${error.message}`
				)
			}
		}
	})

	pairsSocket.on('message', async message => {
		try {
			const rawData = message.toString()
			const data = JSON.parse(rawData)

			if (Array.isArray(data)) {
				for (const item of data) {
					// Обрабатываем только события типа 'XA' и 'AM' для агрегатов
					if (item.ev !== 'XA' && item.ev !== 'AM') {
						continue
					}

					let symbol,
						volume,
						vwap,
						numTrades,
						openPrice,
						closePrice,
						highPrice,
						lowPrice,
						startTime,
						endTime

					if (item.ev === 'XA') {
						// Обработка данных для криптовалют
						symbol = item.pair
						volume = item.v
						vwap = item.vw
						numTrades = item.z
						openPrice = item.o
						closePrice = item.c
						highPrice = item.h
						lowPrice = item.l
						startTime = item.s
						endTime = item.e
					} else if (item.ev === 'AM') {
						// Обработка данных для акций
						symbol = item.sym
						volume = item.v
						vwap = item.vw
						numTrades = item.z
						openPrice = item.o
						closePrice = item.c
						highPrice = item.h
						lowPrice = item.l
						startTime = item.s
						endTime = item.e
					}

					if (!symbol) {
						console.error('Symbol is undefined in subscribePairs:', item)
						continue
					}

					const date = new Date(startTime)

					// Получение корректировки для символа
					const adjustmentResult = await db.oneOrNone(
						'SELECT adjustment FROM price_adjustments WHERE symbol = $1',
						[symbol]
					)
					const adjustment = adjustmentResult
						? parseFloat(adjustmentResult.adjustment)
						: 0

					// Применение корректировки к ценам
					const adjustmentFactor = 1 + adjustment / 100
					const adjustedOpenPrice = parseFloat(openPrice) * adjustmentFactor
					const adjustedHighPrice = parseFloat(highPrice) * adjustmentFactor
					const adjustedLowPrice = parseFloat(lowPrice) * adjustmentFactor
					const adjustedClosePrice = parseFloat(closePrice) * adjustmentFactor

					await redis.set(symbol, adjustedClosePrice)

					// Сохранение данных в базе
					await savePrice(symbol, {
						date: date,
						open: adjustedOpenPrice,
						high: adjustedHighPrice,
						low: adjustedLowPrice,
						close: adjustedClosePrice,
						volume: parseFloat(volume),
						vwap: parseFloat(vwap),
						numTrades: parseInt(numTrades),
						startTime: new Date(startTime),
						endTime: new Date(endTime),
					})

					// Обработка данных для спотовой торговли
					const spotOrders = await getOrdersForSymbolStock(symbol)
					for (const orderS of spotOrders) {
						await processOrder(orderS)
					}
				}
			} else {
				console.log('Received message in subscribePairs:', data)
			}
		} catch (error) {
			console.error(
				'Error processing WebSocket message in subscribePairs:',
				error
			)
		}
	})

	pairsSocket.on('error', error => {
		console.error('WebSocket error in subscribePairs:', error)
	})

	pairsSocket.on('close', () => {
		console.log('WebSocket connection closed in subscribePairs')
	})
}

// Подписка на криптовалютные пары
subscribePairs(cryptoSocket, usdPairs, 'XA')
// Подписка на акции
subscribePairs(stocksSocket, stocks, 'AM')
// Подписка на форекс
// subscribePairs(forexSocket, forexPairs, 'CA')

const subscribeQuotes = async (quotesSocket, params, assetType) => {
	quotesSocket.on('open', () => {
		console.log('WebSocket connection established for quotes')
		quotesSocket.send(
			JSON.stringify({ action: 'auth', params: POLYGON_API_KEY })
		)
		const quotesParams = params.join(',')
		quotesSocket.send(
			JSON.stringify({ action: 'subscribe', params: quotesParams })
		)
	})

	quotesSocket.on('message', async message => {
		try {
			const rawData = message.toString()
			const data = JSON.parse(rawData)

			if (Array.isArray(data)) {
				for (const item of data) {
					let pair, bidPrice, askPrice, bidSize, askSize, timestamp

					// Обработка данных для криптовалют
					if (item.ev === 'XQ') {
						;({
							pair,
							bp: bidPrice,
							bs: bidSize,
							ap: askPrice,
							as: askSize,
							t: timestamp,
						} = item)
					} else if (item.ev === 'Q') {
						// Обработка данных для акций
						;({
							sym: pair,
							bp: bidPrice,
							bs: bidSize,
							ap: askPrice,
							as: askSize,
							t: timestamp,
						} = item)
					}

					if (pair) {
						// Получение корректировки цены для данного символа
						const adjustmentResult = await db.oneOrNone(
							'SELECT adjustment FROM price_adjustments WHERE symbol = $1',
							[pair]
						)
						const adjustment = adjustmentResult
							? parseFloat(adjustmentResult.adjustment)
							: 0

						// Применение корректировки к цене
						const adjustedBidPrice =
							parseFloat(bidPrice) * (1 + adjustment / 100)
						const adjustedAskPrice =
							parseFloat(askPrice) * (1 + adjustment / 100)

						await redis.set(`${pair}_bid`, adjustedBidPrice)
						await redis.set(`${pair}_ask`, adjustedAskPrice)

						// Сохранение скорректированных данных
						await savePriceQuote({
							assetType,
							pair,
							bidPrice: adjustedBidPrice,
							bidSize: parseFloat(bidSize),
							askPrice: adjustedAskPrice,
							askSize: parseFloat(askSize),
							timestamp: new Date(timestamp),
						})
					}
				}
			} else {
				console.log('Received quote message:', data)
			}
		} catch (error) {
			console.error('Error processing WebSocket message:', error)
		}
	})

	quotesSocket.on('error', error => {
		console.error('WebSocket error:', error)
	})

	quotesSocket.on('close', () => {
		console.log('WebSocket connection closed')
	})
}

subscribeQuotes(
	stocksSocket,
	stocks.map(symbol => `Q.${symbol}`), // котировки для акций
	'stock'
)

subscribeQuotes(
	cryptoSocket,
	usdPairs.map(pair => `XQ.${pair}`), // котировки для криптовалют
	'crypto'
)

module.exports = {
	subscribePairs,
	subscribeQuotes,
}
