/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'

// Функция для получения цены по тикеру
const getPriceForTicker = (ticker, prices) => {
	const symbolTickerMap = {
		BNB20: 'BNB',
		USDTERC: 'USDT',
		USDTERC20: 'USDT',
		USDTTRC: 'USDT',
		USDTTRC20: 'USDT',
		USDTTON: 'USDT',
		BNBBEP20: 'BNB',
		USDTBEP: 'USDT',
		USDTBEP20: 'USDT',
		SHIBBEP20: 'SHIB',
		DSH: 'DASH',
		ZCASH: 'ZEC',
	}
	const baseTicker = symbolTickerMap[ticker] || ticker
	const symbol = `${baseTicker}-USD`
	const priceData = prices.find(price => price.symbol === symbol)
	return priceData ? priceData.price : null
}

const SpotPositionRow = ({ position }) => {
	const prices = useSelector(state => state.prices.prices || [])

	// Извлекаем тикер и количество
	const [ticker] = position.symbol.split('-') // Берем первую часть тикера, например, ETH из ETH-USD
	const currentPrice = getPriceForTicker(ticker, prices)

	// Рассчитываем Total
	const total = currentPrice ? position.quantity * currentPrice : 0

	return (
		<tr>
			<td>
				<p className='fb-regular'>{position.symbol}</p>
			</td>
			<td>
				<p className='fb-regular'>{position.quantity}</p>
			</td>
			<td>
				<p className='fb-regular'>
					{currentPrice
						? `${currentPrice.toFixed(2)} USD`
						: 'Price not available'}
				</p>
			</td>
			<td>
				<p className='fb-regular'>{total.toFixed(2)} USD</p>{' '}
				{/* Форматируем Total до 2 знаков */}
			</td>
		</tr>
	)
}

export default SpotPositionRow
