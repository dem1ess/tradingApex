import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function Type7() {
	const prices = useSelector(state => state.prices.prices || [])
	const spotPositions = useSelector(state => state.trading.spotPositions || []) // Получаем позиции вместо кошельков
	const [topAssets, setTopAssets] = useState([])

	// Функция для получения цены по тикеру
	const getPriceForTicker = ticker => {
		const symbolTickerMap = {
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

	// Данные активов для отображения
	useEffect(() => {
		// Преобразуем позиции в массив объектов с тикером, количеством и текущей ценой
		const assets = spotPositions.map(position => {
			const ticker = position.symbol.split('-')[0]
			const price = getPriceForTicker(ticker)
			return {
				ticker,
				name: ticker, // Можно заменить на нормальные имена, если требуется
				amount: position.quantity,
				price: price ? `${price.toFixed(2)} USD` : 'Price not available',
			}
		})

		// Сортируем по количеству (amount) и берем топ-4
		const top4Assets = assets
			.filter(asset => asset.amount > 0) // Фильтрация активов с ненулевым балансом
			.sort((a, b) => b.amount - a.amount) // Сортировка по убыванию количества
			.slice(0, 4)

		setTopAssets(top4Assets)
	}, [prices, spotPositions])

	return (
		<div className='standard-card standard-card--type-7' data-aos='fade-up'>
			<div className='container'>
				<div className='standard-card__head'>
					<h6 className='standard-card__title'>Top Assets</h6>
				</div>
				<div className='standard-card__content'>
					{topAssets.map((asset, index) => (
						<div className='standard-card__content__list' key={asset.ticker}>
							<div className='standard-card__content__list-info-left'>
								<p className='fb-regular fb-regular--bold standard-card__content__list-info-value'>
									{asset.price} {/* Цена актива */}
								</p>
								<p className='fb-regular standard-card__content__list-info-crypto'>
									{asset.name}
								</p>
							</div>
							<div className='standard-card__content__list-info-right'>
								<div className='standard-card__content__list-info-infusion'>
									<p
										className={`fb-sm standard-card__content__list-info-infusion-value `}
									>
										{asset.amount} {asset.ticker}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className='standard-card__vignette'></div>
			</div>
		</div>
	)
}
