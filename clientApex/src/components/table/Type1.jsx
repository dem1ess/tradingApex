import { useState } from 'react'
import { FaSortDown, FaSortUp } from 'react-icons/fa'
import { useSelector } from 'react-redux'

export default function TableType1() {
	const user = useSelector(state => state.auth.data)
	const spotPositions = useSelector(state => state.trading.spotPositions || []) // Получаем данные из spotPositions
	const prices = useSelector(state => state.prices.prices || [])

	// Состояния для сортировки
	const [sortOrder, setSortOrder] = useState('asc') // asc для сортировки по возрастанию, desc — по убыванию
	const [sortField, setSortField] = useState('total') // Поле для сортировки

	// Функция для получения цены по тикеру
	const getPriceForTicker = ticker => {
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

	// Функция для сортировки активов по выбранному полю
	const sortAssets = positions => {
		return positions
			.filter(position => position.quantity > 0) // Показываем только те, у которых ненулевой баланс
			.sort((a, b) => {
				const balanceA = a.quantity
				const balanceB = b.quantity

				const priceA = getPriceForTicker(a.symbol.split('-')[0]) || 0
				const priceB = getPriceForTicker(b.symbol.split('-')[0]) || 0

				const totalA = balanceA * priceA
				const totalB = balanceB * priceB

				if (sortField === 'amount') {
					return sortOrder === 'asc' ? balanceA - balanceB : balanceB - balanceA
				} else if (sortField === 'price') {
					return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
				} else if (sortField === 'total') {
					return sortOrder === 'asc' ? totalA - totalB : totalB - totalA
				} else {
					// Сортировка по изменению за 24 часа (рандомная логика)
					const changeA = Math.random() * 5
					const changeB = Math.random() * 5
					return sortOrder === 'asc' ? changeA - changeB : changeB - changeA
				}
			})
	}

	// Функция для изменения поля и порядка сортировки
	const toggleSortOrder = field => {
		if (sortField === field) {
			// Меняем порядок сортировки, если поле уже выбрано
			setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'))
		} else {
			// Меняем поле сортировки
			setSortField(field)
			setSortOrder('asc') // Сбрасываем сортировку на возрастание при смене поля
		}
	}

	// Отображение иконок сортировки
	const renderSortIcon = field => {
		if (sortField === field) {
			return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
		}
		return <FaSortDown /> // Показываем стрелку по умолчанию
	}

	return (
		<div className='table-wrapper table--type-1' data-aos='fade-up'>
			<div className='table-container'>
				<table className='table table-content'>
					<thead>
						<tr>
							<th className='fb-regular table__head'>Asset</th>
							<th className='fb-regular table__head'>
								Amount
								<span
									onClick={() => toggleSortOrder('amount')}
									className='sort-button'
								>
									{renderSortIcon('amount')}
								</span>
							</th>
							<th className='fb-regular table__head'>
								Price (USD)
								<span
									onClick={() => toggleSortOrder('price')}
									className='sort-button'
								>
									{renderSortIcon('price')}
								</span>
							</th>
							<th className='fb-regular table__head'>
								Total (USD)
								<span
									onClick={() => toggleSortOrder('total')}
									className='sort-button'
								>
									{renderSortIcon('total')}
								</span>
							</th>
							<th className='fb-regular table__head'>
								24h Change
								<span
									onClick={() => toggleSortOrder('change')}
									className='sort-button'
								>
									{renderSortIcon('change')}
								</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{/* Сортировка активов и фильтрация по ненулевым балансам */}
						{sortAssets(spotPositions).map(position => {
							const ticker = position.symbol.split('-')[0]
							const price = getPriceForTicker(ticker)
							const usdValue = price
								? (position.quantity * price).toFixed(2)
								: 'Price not available'
							const priceInUsd = price
								? price.toFixed(2)
								: 'Price not available'
							const percentageChange = price
								? `${(Math.random() * 5).toFixed(2)}%`
								: 'N/A'

							return (
								<tr key={ticker}>
									<td className='table__assets'>
										<div className='table__assets-crypto'>
											<img
												src={`/images/icons/logo-${ticker.toLowerCase()}.svg`}
												alt=''
												className='table__assets-crypto-icon'
											/>
											<p className='fb-regular fb-regular--bold table__assets-crypto-abbr'>
												{ticker}
											</p>
										</div>
									</td>
									<td>
										<p className='fb-regular table__amount'>
											{position.quantity}
										</p>
									</td>
									<td>
										<p className='fb-regular table__price'>USD {priceInUsd}</p>
									</td>
									<td>
										<p className='fb-regular table__total'>USD {usdValue}</p>
									</td>
									<td>
										<p
											className={`fb-regular table__market ${
												price ? 'text-bullish' : 'text-bearish'
											}`}
										>
											{percentageChange}
										</p>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
