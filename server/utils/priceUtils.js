// utils/priceUtils.js
const Redis = require('ioredis')

const redisConfig = {
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
}
const redis = new Redis(redisConfig)

const usdPairs = [
	'BTC-USD',
	'ETH-USD',
	'USDT-USD',
	'XRP-USD',
	'ADA-USD',
	'SOL-USD',
	'DOGE-USD',
	'LTC-USD',
	'SHIB-USD',
	'TRX-USD',
	'XLM-USD',
	'ETC-USD',
	'BCH-USD',
	'XMR-USD',
	'EOS-USD',
	'ZEC-USD',
	'DASH-USD',
]

const stocks = [
	'AAPL',
	'MSFT',
	'GOOGL',
	'AMZN',
	'FB',
	'TSLA',
	'BRK.B',
	'JNJ',
	'V',
	'WMT',
	'JPM',
	'PG',
	'UNH',
	'MA',
	'NVDA',
	'HD',
	'DIS',
	'PYPL',
	'VZ',
	'ADBE',
	'NFLX',
	'KO',
	'INTC',
	'CMCSA',
	'PFE',
	'PEP',
	'CSCO',
	'XOM',
	'T',
	'NKE',
	'MRK',
	'ABT',
	'CVX',
	'MCD',
	'ORCL',
	'BA',
	'MDT',
	'WFC',
	'MMM',
	'HON',
	'BMY',
	'LMT',
	'AMGN',
	'IBM',
	'GE',
	'ACN',
	'AVGO',
	'QCOM',
	'TXN',
	'GILD',
	'CAT',
	'SBUX',
	'BLK',
	// 'GS',
	// 'DE',
	// 'BKNG',
	// 'MO',
	// 'TGT',
	// 'AXP',
	// 'DUK',
	// 'ADP',
	// 'CCI',
	// 'CL',
	// 'SCHW',
	// 'ICE',
	// 'USB',
	// 'NSC',
	// 'CSX',
	// 'SPGI',
	// 'TJX',
	// 'CCI',
	// 'D',
	// 'ALL',
	// 'CME',
	// 'SYK',
	// 'SO',
	// 'ECL',
	// 'PLD',
	// 'ZTS',
	// 'ISRG',
	// 'ITW',
	// 'HUM',
	// 'NOC',
	// 'CTSH',
	// 'ADSK',
	// 'NEM',
	// 'APD',
	// 'KHC',
	// 'MET',
	// 'GM',
	// 'KR',
	// 'EXC',
	// 'ETN',
	// 'FDX',
	// 'ANTM',
	// 'MNST',
	// 'DG',
	// 'VLO',
	// 'HES',
	// 'WBA',
	// 'PSA',
	// 'KMB',
	// 'ED',
]

const getCurrentPrice = async symbol => {
	const price = await redis.get(symbol)
	return price ? parseFloat(price) : null
}

const getAllCurrentPrices = async () => {
	const allSymbols = [...usdPairs, ...stocks]
	const prices = await Promise.all(
		allSymbols.map(async symbol => {
			const price = await getCurrentPrice(symbol)
			return { symbol, price }
		})
	)
	// console.log(prices) // Логируем переменную prices
	return prices
}

module.exports = {
	getCurrentPrice,
	getAllCurrentPrices,
	usdPairs,
	stocks,
}
