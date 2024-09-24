export default function Type1V1() {
	return (
		<div className='complete-card complete-card--type-1-v1' data-aos='fade-up'>
			<div className='complete-card__balance'>
				<div className='complete-card__balance-head'>
					<div className='complete-card__balance-head__title'>
						<h6 className='complete-card__balance-head__title-text'>Balance</h6>
						<div className='complete-card__balance-head__title-influsion'>
							<img
								src='/images/icons/arrow-bullish.svg'
								alt=''
								className='complete-card__balance-head__title-influsion-icon'
							/>
							<p className='fb-regular fb-regular--bold complete-card__balance-head__title-influsion-value text-bullish'>
								2.36%
							</p>
						</div>
					</div>
					<p className='complete-card__balance-head__value'>USD 12.243,55</p>
				</div>
				<div className='complete-card__balance-revenue'>
					<div className='complete-card__balance-revenue__income'>
						<div className='balance-revenue__income-title'>
							<img
								src='/images/icons/arrow-bullish.svg'
								alt=''
								className='balance-revenue__income-title-icon'
							/>
							<p className='fb-regular balance-revenue__income-title-text'>
								Income
							</p>
						</div>
						<p className='fd-sm fd-sm--bold balance-revenue__income-value'>
							USD 12.243,55
						</p>
					</div>
					<div className='complete-card__balance-revenue__separator'></div>
					<div className='complete-card__balance-revenue__expenses'>
						<div className='balance-revenue__expenses-title'>
							<img
								src='/images/icons/arrow-bearish.svg'
								alt=''
								className='balance-revenue__expenses-title-icon'
							/>
							<p className='fb-regular balance-revenue__expenses-title-text'>
								Expenses
							</p>
						</div>
						<p className='fd-sm fd-sm--bold balance-revenue__expenses-value'>
							USD 3.132,23
						</p>
					</div>
				</div>
			</div>
			<div className='complete-card__separator'></div>
			<div className='complete-card__wallet'>
				<div className='complete-card__wallet-head'>
					<h6 className='complete-card__wallet-head__title-text'>Wallet</h6>
					<p className='fb-regular complete-card__wallet-head__title-total-currencies'>
						3 Currencies
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
								alt=''
								className='complete-card__wallet-data__donut-chart-label-icon'
							></img>
							<p className='fd-sm fd-sm--bold complete-card__wallet-data__donut-chart-label-text'>
								2.31%
							</p>
						</div>
					</div>
					<div className='complete-card__wallet-data__currencies'>
						<div className='wallet-data__currency'>
							<img
								src='/images/icons/logo-btc.svg'
								alt=''
								className='wallet-data__currency-icon'
							/>
							<div className='wallet-data__currency-text'>
								<p className='fb-regular fb-regular--bold wallet-data__currency-text-acronym'>
									BTC
								</p>
								<p className='fb-regular wallet-data__currency-text-name'>
									Bitcoin
								</p>
							</div>
							<div className='wallet-data__currency-influsion'>
								<img
									src='/images/icons/arrow-bullish.svg'
									alt=''
									className='wallet-data__currency-influsion-icon'
								/>
								<p className='fb-sm wallet-data__currency-influsion-value'>
									2.36%
								</p>
							</div>
						</div>
						<div className='wallet-data__currency'>
							<img
								src='/images/icons/logo-eth.svg'
								alt=''
								className='wallet-data__currency-icon'
							/>
							<div className='wallet-data__currency-text'>
								<p className='fb-regular fb-regular--bold wallet-data__currency-text-acronym'>
									ETH
								</p>
								<p className='fb-regular wallet-data__currency-text-name'>
									Ethereum
								</p>
							</div>
							<div className='wallet-data__currency-influsion'>
								<img
									src='/images/icons/arrow-bullish.svg'
									alt=''
									className='wallet-data__currency-influsion-icon'
								/>
								<p className='fb-sm wallet-data__currency-influsion-value'>
									1.80%
								</p>
							</div>
						</div>
						<div className='wallet-data__currency'>
							<img
								src='/images/icons/logo-usdt.svg'
								alt=''
								className='wallet-data__currency-icon'
							/>
							<div className='wallet-data__currency-text'>
								<p className='fb-regular fb-regular--bold wallet-data__currency-text-acronym'>
									USDT
								</p>
								<p className='fb-regular wallet-data__currency-text-name'>
									Tether
								</p>
							</div>
							<div className='wallet-data__currency-influsion'>
								<img
									src='/images/icons/arrow-bullish.svg'
									alt=''
									className='wallet-data__currency-influsion-icon'
								/>
								<p className='fb-sm wallet-data__currency-influsion-value'>
									1.64%
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
