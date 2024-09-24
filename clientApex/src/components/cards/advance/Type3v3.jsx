export default function Type3V3() {
	return (
		<div className='advance-card advance-card--type-3-v3' data-aos='fade-up'>
			<div className='advance-card-left'>
				<div className='advance-card__title'>
					<img
						src='/images/icons/logo-btc.svg'
						alt=''
						className='advance-card__title-image'
					/>
					<h6 className='advance-card__title-text'>BTC</h6>
				</div>
				<div className='advance-card__balance-wrapper'>
					<div className='advance-card__balance'>
						<p className='advance-card__balance-title'>Total Balance</p>
						<p className='advance-card__balance-crypto-value'>0.2133214214</p>
						<p className='advance-card__balance-currency-value'>
							3,230.98
							<span className='advance-card__balance-currency'> USD</span>
						</p>
					</div>

					<div className='advance-card__balance-chart'>
						<div className='advance-card__balance-chart-wrapper'>
							<div
								id='advance-card__card-line-7'
								className='advance-card__balance-chart-render'
							></div>
						</div>
						<div className='advance-card__balance-chart-percent'>
							<img
								src='/images/icons/arrow-bearish.svg'
								alt=''
								className='advance-card__balance-chart-percent-image'
							/>
							<p className='advance-card__balance-chart-percent-value text-bearish'>
								2.36%
							</p>
						</div>
					</div>
				</div>
				<div className='advance-card__buttons'>
					<button className='btn btn-primary advance-card__button btn-sm btn-pill'>
						Withdraw
					</button>
					<button className='btn btn-secondary advance-card__button btn-sm'>
						Deposit
					</button>
				</div>
			</div>

			<div className='advance-card-separator'></div>

			<div className='advance-card-right'>
				<div className='advance-card__card'>
					<div className='advance-card__card-content'>
						<div className='advance-card__card-desc'>
							<p className='advance-card__card-desc-title'>Exchange Balance</p>
							<div className='advance-card__card-desc-value'>
								<p className='advance-card__card-desc-value-crypto'>
									0.213435345
								</p>
								<p className='advance-card__card-desc-value-currency'>
									3,897.98 USD
								</p>
							</div>
						</div>
						<div className='advance-card__card-data'>
							<div className='advance-card__card-chart-wrapper'>
								<div
									id='advance-card__card-line-3'
									className='advance-card__card-chart-render'
								></div>
							</div>
							<p className='advance-card__card-percent'>+0.55%</p>
						</div>
					</div>
					<div className='advance-card__card-progress'>
						<div className='advance-card__card-progress-bar progress-bar--purple'></div>
					</div>
				</div>
				<div className='advance-card__card'>
					<div className='advance-card__card-content'>
						<div className='advance-card__card-desc'>
							<p className='advance-card__card-desc-title'>Assets Balance</p>
							<div className='advance-card__card-desc-value'>
								<p className='advance-card__card-desc-value-crypto'>
									0.213435345
								</p>
								<p className='advance-card__card-desc-value-currency'>
									3,897.98 USD
								</p>
							</div>
						</div>
						<div className='advance-card__card-data'>
							<div className='advance-card__card-chart-wrapper'>
								<div
									id='advance-card__card-line-4'
									className='advance-card__card-chart-render'
								></div>
							</div>
							<p className='advance-card__card-percent'>+0.75%</p>
						</div>
					</div>
					<div className='advance-card__card-progress'>
						<div className='advance-card__card-progress-bar progress-bar--green'></div>
					</div>
				</div>
			</div>
		</div>
	)
}
