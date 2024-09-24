export default function Type1() {
	return (
		<div className='advance-card advance-card--type-1-v1' data-aos='fade-up'>
			<div className='advance-card__title'>
				<h6 className='advance-card__title-text'>Exchange</h6>
				<img
					src='/images/icons/exchange-white.svg'
					alt=''
					className='advance-card__title-icon'
				/>
			</div>
			<div className='advance-card__price'>
				<div className='advance-card__price-crypto'>
					<p className='advance-card__price-crypto-value'>1</p>
					<p className='advance-card__price-crypto-name'>BTC</p>
				</div>
				<img
					src='/images/icons/arrow-right-white.svg'
					alt=''
					className='advance-card__price-arrow'
				/>
				<div className='advance-card__price-currency'>
					<p className='advance-card__price-currency-value'>53,260.20</p>
					<p className='advance-card__price-currency-name'>USD</p>
				</div>
			</div>
			<div className='advance-card__forms-currency'>
				<div className='advance-card__forms-currency--get'>
					<p className='advance-card__forms-currency__title'>Get</p>
					<div className='forms-currency forms-currency--advance-card'>
						<div className='forms-group forms-group--value'>
							<input
								type='number'
								min='0'
								value='5000'
								className='form-control forms-currency__value'
							/>
						</div>
						<div className='forms-currency__line'></div>
						<div
							className='forms-group forms-group--currency js-forms-group--currency'
							id='custom-select-currency-1'
						>
							<div className='forms-group__items selected' data-selected='usd'>
								<img
									className='fg-items__icon'
									src='/images/icons/usd.svg'
									alt=''
								/>
							</div>
							<img
								className='forms-currency__icon-arrow-down'
								src='/images/icons/arrow-down.svg'
								alt=''
							/>
							<div className='forms-group__dropdown js-forms-group__dropdown'>
								<div className='forms-group__items active' data-selected='usd'>
									<img
										className='fg-items__icon'
										src='/images/icons/usd.svg'
										alt=''
									/>
								</div>
								<div className='forms-group__items' data-selected='btc'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-btc.svg'
										alt=''
									/>
								</div>
								<div className='forms-group__items' data-selected='eth'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-eth.svg'
										alt=''
									/>
								</div>
								<div className='forms-group__items' data-selected='bnb'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-bnb.svg'
										alt=''
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className='advance-card__forms-currency--pay'>
					<p className='advance-card__forms-currency__title'>Pay</p>
					<div className='forms-currency forms-currency--advance-card'>
						<div className='forms-group forms-group--value'>
							<input
								type='number'
								min='0'
								value='5000'
								className='form-control forms-currency__value'
							/>
						</div>
						<div className='forms-currency__line'></div>
						<div
							className='forms-group forms-group--currency js-forms-group--currency'
							id='custom-select-currency-2'
						>
							<div className='forms-group__items selected' data-selected='usd'>
								<img
									className='fg-items__icon'
									src='/images/icons/logo-btc.svg'
									alt=''
								/>
							</div>
							<img
								className='forms-currency__icon-arrow-down'
								src='/images/icons/arrow-down.svg'
								alt=''
							/>
							<div className='forms-group__dropdown js-forms-group__dropdown'>
								<div className='forms-group__items active' data-selected='btc'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-btc.svg'
										alt=''
									/>
								</div>
								<div className='forms-group__items' data-selected='eth'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-eth.svg'
										alt=''
									/>
								</div>
								<div className='forms-group__items' data-selected='bnb'>
									<img
										className='fg-items__icon'
										src='/images/icons/logo-bnb.svg'
										alt=''
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<button className='advance-card__button btn btn-primary btn-pill'>
				Exchange
			</button>
		</div>
	)
}
