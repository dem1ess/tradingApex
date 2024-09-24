import ApexCharts from 'apexcharts'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import TopUpModal from '../../TopUpModal' // Импортируем модальное окно

// Функция для рендеринга круговой диаграммы
function walletDonutChart(series, colors, htmlEl) {
	if (document.querySelector(htmlEl)) {
		const options = {
			series: series,
			colors: colors,
			chart: {
				type: 'donut',
				width: '163px',
				height: '163px',
				redrawOnWindowResize: true,
				redrawOnParentResize: true,
				toolbar: { show: false },
				zoom: { enabled: false },
				stacked: false,
			},
			dataLabels: { enabled: false },
			legend: { show: false },
			tooltip: { enabled: false },
			stroke: {
				show: true,
				colors: '#1E1F25',
				width: 3,
			},
		}

		const chart = new ApexCharts(document.querySelector(htmlEl), options)
		return chart
	}
}

export default function Type1V3() {
	const transactions = useSelector(state => state.transaction.transactions)
	const spotPositions = useSelector(state => state.trading.spotPositions || [])
	const prices = useSelector(state => state.prices.prices || [])
	const user = useSelector(state => state.auth.data)
	const mainBalance = Number(user?.main_balance || 0)

	const [showTopUpModal, setShowTopUpModal] = useState(false) // Состояние для отображения модального окна

	const getPriceForTicker = ticker => {
		const symbolTickerMap = {
			BNB20: 'BNB',
			USDTERC: 'USDT',
			// добавьте другие маппинги...
		}
		const baseTicker = symbolTickerMap[ticker] || ticker
		const symbol = `${baseTicker}-USD`
		const priceData = prices.find(price => price.symbol === symbol)
		return priceData ? priceData.price : null
	}

	const calculateTotalByStatusInUSD = (status, type) => {
		return transactions
			.filter(
				transaction =>
					transaction.status === status && transaction.type === type
			)
			.reduce((total, transaction) => {
				const priceInUSD = getPriceForTicker(transaction.wallet_ticker) || 1
				const amountInUSD = parseFloat(transaction.amount) * priceInUSD
				return total + amountInUSD
			}, 0)
			.toFixed(2)
	}

	const totalIncomeUSD = calculateTotalByStatusInUSD('approved', 'deposit')
	const totalExpensesUSD = calculateTotalByStatusInUSD('approved', 'withdraw')

	const filteredPositions = spotPositions.filter(
		position => position.quantity > 0
	)

	const walletSeries = filteredPositions.map(position => {
		const price = getPriceForTicker(position.symbol.split('-')[0]) || 0
		return position.quantity * price
	})

	const walletColors = ['#F7931A', '#30E0A1', '#BD47FB']
	const walletCurrencies = filteredPositions.map(
		position => position.symbol.split('-')[0]
	)

	useEffect(() => {
		let chart1, chart2
		// Инициализация диаграмм только если есть данные
		if (walletSeries.length > 0) {
			// Уничтожаем существующую диаграмму, если она есть
			if (chart1) chart1.destroy()
			if (chart2) chart2.destroy()

			// Создаем новую диаграмму
			chart1 = walletDonutChart(
				walletSeries,
				walletColors,
				'#complete-card__wallet-data__donut-chart-1'
			)
			if (chart1) chart1.render()

			chart2 = walletDonutChart(
				walletSeries,
				walletColors,
				'#complete-card__wallet-data__donut-chart-2'
			)
			if (chart2) chart2.render()
		}

		// Удаляем диаграммы при размонтировании компонента
		return () => {
			if (chart1) chart1.destroy()
			if (chart2) chart2.destroy()
		}
	}, [walletSeries])

	// Функция для открытия модального окна
	const handleDepositClick = () => {
		setShowTopUpModal(true)
	}

	// Функция для закрытия модального окна
	const handleCloseModal = () => {
		setShowTopUpModal(false)
	}

	return (
		<div className='complete-card complete-card--type-1-v3' data-aos='fade-up'>
			<div className='complete-card__balance'>
				<div className='complete-card__balance-head'>
					<div className='complete-card__balance-head__title'>
						<h6 className='complete-card__balance-head__title-text'>Balance</h6>
						<div className='complete-card__balance-head__title-influsion'>
							<button
								className='btn btn-primary advance-card__button btn-sm btn-pill'
								onClick={handleDepositClick} // Открытие модального окна
							>
								Deposit
							</button>
						</div>
					</div>
					<p className='complete-card__balance-head__value'>
						USD {mainBalance.toFixed(2)}
					</p>
				</div>
				<div className='complete-card__balance-revenue'>
					<div className='complete-card__balance-revenue__income'>
						<div className='balance-revenue__income-title'>
							<img
								src='/images/icons/arrow-bullish.svg'
								alt='Bullish Arrow'
								className='balance-revenue__income-title-icon'
							/>
							<p className='fb-regular balance-revenue__income-title-text'>
								Income
							</p>
						</div>
						<p className='fd-sm fd-sm--bold balance-revenue__income-value'>
							USD {totalIncomeUSD}
						</p>
					</div>
					<div className='complete-card__balance-revenue__separator'></div>
					<div className='complete-card__balance-revenue__expenses'>
						<div className='balance-revenue__expenses-title'>
							<img
								src='/images/icons/arrow-bearish.svg'
								alt='Bearish Arrow'
								className='balance-revenue__expenses-title-icon'
							/>
							<p className='fb-regular balance-revenue__expenses-title-text'>
								Expenses
							</p>
						</div>
						<p className='fd-sm fd-sm--bold balance-revenue__expenses-value'>
							USD {totalExpensesUSD}
						</p>
					</div>
				</div>
			</div>
			<div className='complete-card__separator'></div>
			<div className='complete-card__wallet'>
				<div className='complete-card__wallet-head'>
					<h6 className='complete-card__wallet-head__title-text'>Wallet</h6>
					<p className='fb-regular complete-card__wallet-head__title-total-currencies'>
						{walletCurrencies.length} Currencies
					</p>
				</div>
				<div className='complete-card__wallet-data'>
					<div className='complete-card__wallet-data__chart'>
						<div
							id='complete-card__wallet-data__donut-chart-1'
							className='complete-card__wallet-data__donut-chart-render'
						></div>
						<div className='complete-card__wallet-data__donut-chart-label'>
							<img
								src='/images/icons/arrow-bullish.svg'
								alt='Bullish Arrow'
								className='complete-card__wallet-data__donut-chart-label-icon'
							></img>
							<p className='fd-sm fd-sm--bold complete-card__wallet-data__donut-chart-label-text'>
								2.31%
							</p>
						</div>
					</div>
					<div
						className='complete-card__wallet-data__currencies'
						style={{ height: '150px', overflowY: 'auto' }}
					>
						{walletCurrencies.slice(0, 3).map((ticker, index) => (
							<div className='wallet-data__currency' key={ticker}>
								<img
									src={`/images/icons/logo-${ticker.toLowerCase()}.svg`}
									alt=''
									className='wallet-data__currency-icon'
								/>
								<div className='wallet-data__currency-text'>
									<p className='fb-regular fb-regular--bold wallet-data__currency-text-acronym'>
										{ticker}
									</p>
									<p className='fb-regular wallet-data__currency-text-name'>
										{ticker === 'BTC' ? 'Bitcoin' : ticker}
									</p>
								</div>
								<div className='wallet-data__currency-influsion'>
									<p className='fb-sm wallet-data__currency-influsion-value'>
										{walletSeries[index]?.toFixed(2)} USD
									</p>
								</div>
							</div>
						))}
						{/* Добавляем прокручиваемую часть для оставшихся валют */}
						{walletCurrencies.length > 3 && (
							<div className='additional-wallets'>
								{walletCurrencies.slice(3).map((ticker, index) => (
									<div className='wallet-data__currency' key={ticker}>
										<img
											src={`/images/icons/logo-${ticker.toLowerCase()}.svg`}
											alt=''
											className='wallet-data__currency-icon'
										/>
										<div className='wallet-data__currency-text'>
											<p className='fb-regular fb-regular--bold wallet-data__currency-text-acronym'>
												{ticker}
											</p>
											<p className='fb-regular wallet-data__currency-text-name'>
												{ticker === 'BTC' ? 'Bitcoin' : ticker}
											</p>
										</div>
										<div className='wallet-data__currency-influsion'>
											<img
												src='/images/icons/arrow-bullish.svg'
												alt='Bullish Arrow'
												className='wallet-data__currency-influsion-icon'
											/>
											<p className='fb-sm wallet-data__currency-influsion-value'>
												{walletSeries[index + 3]?.toFixed(2)} USD
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
			<div className='complete-card__separator'></div>

			{/* Модальное окно для пополнения счета */}
			<TopUpModal show={showTopUpModal} handleClose={handleCloseModal} />
		</div>
	)
}
