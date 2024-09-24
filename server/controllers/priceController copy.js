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

// Инициализация Redis
const redisConfig = {
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
}
const redis = new Redis(redisConfig)
const POLYGON_API_KEY = process.env.POLYGON_API_KEY

// Создание WebSocket соединений
const cryptoSocket = new WebSocket('wss://socket.polygon.io/crypto')
const stocksSocket = new WebSocket('wss://socket.polygon.io/stocks')
const forexSocket = new WebSocket('wss://socket.polygon.io/forex')

// Функция подписки на пары
const subscribePairs = async (socket, pairs, prefix) => {
	socket.on('open', async () => {
		console.log('WebSocket connection established')
		socket.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }))

		if (!Array.isArray(pairs)) {
			console.error(`Expected an array but received: ${typeof pairs}`)
			return
		}

		for (const pair of pairs) {
			try {
				await createPriceTable(pair)
				console.log(`Created table for pair: ${pair}`)
				socket.send(
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

	socket.on('message', async message => {
		try {
			const rawData = message.toString()
			const data = JSON.parse(rawData)

			if (Array.isArray(data)) {
				for (const item of data) {
					if (item.ev === `${prefix}`) {
						const {
							pair: symbol,
							v: volume,
							vw: vwap,
							z: numTrades,
							o: openPrice,
							c: closePrice,
							h: highPrice,
							l: lowPrice,
							s: startTime,
							e: endTime,
						} = item

						console.log(
							`Pair: ${symbol}, Volume: ${volume}, VWAP: ${vwap}, Trades: ${numTrades}`
						)

						const date = new Date(startTime)

						await redis.set(symbol, closePrice)

						await savePrice(symbol, {
							date: date,
							open: parseFloat(openPrice),
							high: parseFloat(highPrice),
							low: parseFloat(lowPrice),
							close: parseFloat(closePrice),
							volume: parseFloat(volume),
							vwap: parseFloat(vwap),
							numTrades: parseInt(numTrades),
						})

						// Обработка данных для фьючерсов и спотовой торговли
						// const orders = await getOrdersForSymbol(symbol)
						// for (const order of orders) {
						// 	await futuresController.processOrder(order)
						// }

						const spotOrders = await getOrdersForSymbolStock(symbol)
						for (const orderS of spotOrders) {
							await processOrder(orderS)
						}
					}
				}
			} else {
				console.log('Received message:', data)
			}
		} catch (error) {
			console.error('Error processing WebSocket message:', error)
		}
	})

	socket.on('error', error => {
		console.error('WebSocket error:', error)
	})

	socket.on('close', () => {
		console.log('WebSocket connection closed')
	})
}

// Подписка на криптовалютные пары
subscribePairs(cryptoSocket, usdPairs, 'XA')
// Подписка на акции
subscribePairs(stocksSocket, stocks, 'AM')
// Подписка на форекс
subscribePairs(forexSocket, forexPairs, 'CA')

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
		console.log(`Subscribed to quotes for: ${params.join(', ')}`)
	})

	quotesSocket.on('message', async message => {
		try {
			const rawData = message.toString()
			const data = JSON.parse(rawData)

			if (Array.isArray(data)) {
				for (const item of data) {
					// Обработка данных для криптовалют
					if (item.ev === 'XQ') {
						const {
							pair,
							bp: bidPrice,
							bs: bidSize,
							ap: askPrice,
							as: askSize,
							t: timestamp,
						} = item

						console.log(
							`Crypto Quote - Pair: ${pair}, Bid Price: ${bidPrice}, Ask Price: ${askPrice}`
						)

						await redis.set(`${pair}_bid`, bidPrice)
						await redis.set(`${pair}_ask`, askPrice)

						await savePriceQuote({
							assetType: 'crypto',
							pair,
							bidPrice: parseFloat(bidPrice),
							bidSize: parseFloat(bidSize),
							askPrice: parseFloat(askPrice),
							askSize: parseFloat(askSize),
							timestamp: new Date(timestamp),
						})
					}

					// Обработка данных для форекса
					if (item.ev === 'C') {
						const { p: pair, a: askPrice, b: bidPrice, t: timestamp } = item

						console.log(
							`Forex Quote - Pair: ${pair}, Bid Price: ${bidPrice}, Ask Price: ${askPrice}`
						)

						await redis.set(`${pair}_bid`, bidPrice)
						await redis.set(`${pair}_ask`, askPrice)

						await savePriceQuote({
							assetType: 'forex',
							pair,
							bidPrice: parseFloat(bidPrice),
							askPrice: parseFloat(askPrice),
							timestamp: new Date(timestamp),
						})
					}

					// Обработка данных для акций
					if (item.ev === 'Q') {
						const {
							sym: pair,
							bx: bidSize,
							bp: bidPrice,
							ax: askSize,
							ap: askPrice,
							t: timestamp,
						} = item

						console.log(
							`Stock Quote - Pair: ${pair}, Bid Price: ${bidPrice}, Ask Price: ${askPrice}`
						)

						await redis.set(`${pair}_bid`, bidPrice)
						await redis.set(`${pair}_ask`, askPrice)

						await savePriceQuote({
							assetType: 'stock',
							pair,
							bidPrice: parseFloat(bidPrice),
							bidSize: parseFloat(bidSize),
							askPrice: parseFloat(askPrice),
							askSize: parseFloat(askSize),
							timestamp: new Date(timestamp),
						})
					}
				}
			} else {
				console.log('Received quote message:', data)
			}
		} catch (error) {
			console.error('Error processing quote WebSocket message:', error)
		}
	})

	quotesSocket.on('error', error => {
		console.error('WebSocket error:', error)
	})

	quotesSocket.on('close', () => {
		console.log('WebSocket connection closed')
	})
}

// Пример использования функции subscribeQuotes
subscribeQuotes(
	stocksSocket,
	stocks.map(symbol => `Q.${symbol}`),
	'stock'
)
subscribeQuotes(
	forexSocket,
	forexPairs.map(pair => `C.${pair}`),
	'forex'
)
subscribeQuotes(
	cryptoSocket,
	usdPairs.map(pair => `XQ.${pair}`),
	'crypto'
)

const unsubscribe = function (pairsToUnsubscribe, prefix) {
	pairsToUnsubscribe.forEach(pair => {
		cryptoSocket.send(
			JSON.stringify({ action: 'unsubscribe', params: `${prefix}.${pair}` })
		)
	})
}

module.exports = { unsubscribe, getCurrentPrice }
