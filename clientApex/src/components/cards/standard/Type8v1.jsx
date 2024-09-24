import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function Type8V1() {
	const selectedSymbol = useSelector(state => state.symbol.selectedSymbol)
	const lastPrice = useSelector(state => state.symbol.lastPrice) // Цена из Redux

	// Локальное состояние для хранения случайных значений
	const [change24h, setChange24h] = useState(0)
	const [low24h, setLow24h] = useState(0)

	// Генерация случайных значений при загрузке компонента или изменении символа
	useEffect(() => {
		const randomChange = (Math.random() * (10 - -10) + -10).toFixed(2) // Случайное число от -10 до 10
		const randomLow = (lastPrice * (Math.random() * 0.9)).toFixed(2) // Случайное значение для low, меньше текущей цены

		setChange24h(parseFloat(randomChange))
		setLow24h(parseFloat(randomLow))
	}, [lastPrice, selectedSymbol])

	return (
		<div className='standard-card standard-card--type-8-v1' data-aos='fade-up'>
			<div className='standard-card__container'>
				<div className='standard-card__items'>
					<div className='standard-card__item standard-card__item--1'>
						<div className='standard-card__item-left'>
							<img
								src={`/images/icons/logo-${selectedSymbol.toLowerCase()}.svg`}
								alt=''
								className='standard-card__item-image'
							/>
							<div className='standard-card__item-desc'>
								<p className='fb-regular standard-card__item-title'>
									{selectedSymbol}
								</p>
								<p className='fd-sm fd-sm--bold standard-card__item-crypto'>
									{selectedSymbol}
								</p>
							</div>
						</div>
						<div className='standard-card__item-collapse'>
							<div className='item-collapse__group-1'>
								<div className='item-collapse__title'>
									<p className='fb-sm item-collapse__title-text'>24h change</p>
									<div className='item-collapse__title-influsion'>
										<img
											src={
												change24h >= 0
													? '/images/icons/arrow-bullish.svg'
													: '/images/icons/arrow-bearish.svg'
											}
											alt=''
											className='item-collapse__title-influsion-icon'
										/>
										<p
											className={`fb-regular fb-regular--bold item-collapse__title-influsion-value ${
												change24h >= 0 ? 'text-bullish' : 'text-bearish'
											}`}
										>
											{change24h}%
										</p>
									</div>
								</div>
								<div className='item-collapse__chart-wrapper'>
									<div
										id='item-collapse__chart-line-1'
										className='item-collapse__chart-render'
									></div>
								</div>
							</div>
							<div className='item-collapse__group-2'>
								<p className='fb-sm item-collapse__price'>
									Last Price:{' '}
									<span
										className={`item-collapse__price-value ${
											change24h >= 0 ? 'text-bullish' : 'text-bearish'
										}`}
									>
										{lastPrice ? lastPrice.toFixed(2) : 'N/A'}
									</span>
								</p>
								<p className='fb-sm item-collapse__price'>
									24h Low:{' '}
									<span className='item-collapse__price-value text-bearish'>
										{low24h}
									</span>
								</p>
							</div>
						</div>
					</div>
					<div className='standard-card__separator'></div>
					<div className='standard-card__item standard-card__item--2'>
						<div className='standard-card__item-left'>
							<p className='fb-regular standard-card__item-title'>24h Change</p>
							<div className='standard-card__item-influsion'>
								<img
									src={
										change24h >= 0
											? '/images/icons/arrow-bullish.svg'
											: '/images/icons/arrow-bearish.svg'
									}
									alt=''
									className='standard-card__item-influsion-icon'
								/>
								<p
									className={`fd-sm fd-sm--bold standard-card__item-influsion-value ${
										change24h >= 0 ? 'text-bullish' : 'text-bearish'
									}`}
								>
									{change24h}%
								</p>
							</div>
						</div>
						<div className='standard-card__item-chart-wrapper'>
							<div
								id='standard-card__item-line-1'
								className='standard-card__item-chart-render'
							></div>
						</div>
					</div>
					<div className='standard-card__separator'></div>
					<div className='standard-card__item standard-card__item--3'>
						<p className='fb-regular standard-card__item-title'>Last Price</p>
						<p className='fd-sm fd-sm--bold standard-card__item-value'>
							{lastPrice ? lastPrice.toFixed(2) : 'N/A'} USD
						</p>
					</div>
					<div className='standard-card__separator'></div>
					<div className='standard-card__item standard-card__item--4'>
						<p className='fb-regular standard-card__item-title'>24h Low</p>
						<p className='fd-sm fd-sm--bold standard-card__item-value'>
							{low24h} USD
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
