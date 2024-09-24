import { useState } from 'react'
import { useSelector } from 'react-redux'
import '../assets/scss/pages/wallet-v1.scss'
import '../assets/scss/pages/wallet-v2.scss'
import Type3v1 from '../components/cards/advance/Type3v1'
import TableType1 from '../components/table/Type1'

export default function Wallet() {
	const user = useSelector(state => state.auth.data)
	const wallets = user?.wallets || {}
	const prices = useSelector(state => state.prices.prices || [])
	const spotPositions = useSelector(state => state.trading.spotPositions || [])

	const [selectedWallet, setSelectedWallet] = useState(Object.keys(wallets)[0]) // Состояние для текущего кошелька
	const [isHovered, setIsHovered] = useState(true) // Состояние для управления hover

	// Функция для переключения кошельков
	const handleWalletSelect = walletKey => {
		setSelectedWallet(walletKey)
	}

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

	// Функция для получения количества по тикеру из spotPositions
	const getQuantityForTicker = ticker => {
		const symbol = `${ticker}-USD`
		const position = spotPositions.find(pos => pos.symbol === symbol)
		return position ? position.quantity : 0
	}

	return (
		<div className='wallet wallet--v2'>
			<div className='container container--wallet-v2'>
				<div className='container container--dashboard'>
					<h2 className='dashboard__title mb-4'>Crypto Wallet</h2>
					<div className='wallet-group'>
						<div
							className='wallet-group--left'
							style={{
								overflowX: isHovered ? 'auto' : 'hidden', // Устанавливаем overflow в зависимости от состояния
								whiteSpace: 'nowrap', // Для предотвращения переноса строк
							}}
						>
							{/* Динамически отображаем все кошельки пользователя */}
							{Object.entries(wallets).map(([ticker]) => {
								const price = getPriceForTicker(ticker)
								const quantity = getQuantityForTicker(ticker)
								const usdValue = price
									? (quantity * price).toFixed(2)
									: 'Price not available'

								return (
									<div
										key={ticker}
										onClick={() => handleWalletSelect(ticker)}
										className={`standard-card ${
											selectedWallet === ticker
												? 'standard-card--type-6-v1'
												: 'standard-card--type-6-v2'
										}`}
									>
										<div className='container'>
											<div className='standard-card__content'>
												<div className='standard-card__content-head'>
													<div className='standard-card__content-currency'>
														<img
															src={`/images/icons/${ticker}.svg`}
															alt=''
															className='standard-card__content-currency-icon'
														/>
														<p className='standard-card__content-currency-name'>
															{ticker}
														</p>
													</div>
													{/* Отображаем текущую рыночную цену */}
													<p className='standard-card__content-percentage text-bullish'>
														{price ? `${price} USD` : 'Price not available'}
													</p>
												</div>
												<p className='standard-card__content-price-1'>
													{quantity}
												</p>
												<p className='standard-card__content-price-2'>
													{usdValue} USD
												</p>
												<div className='standard-card__content-chart-wrapper'>
													<div
														id={`standard-card__content-chart-${ticker}`}
														className='standard-card__content-chart-render'
													></div>
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
						<div className='wallet-group--right'>
							{/* Передаем выбранный кошелек в компонент Type3v1 */}
							<Type3v1
								selectedWallet={selectedWallet}
								walletData={wallets[selectedWallet]}
							/>
							<TableType1 />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
