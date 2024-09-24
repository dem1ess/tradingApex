import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
	createFuturesOrder,
	createSpotOrder,
	fetchFuturesOrders,
	fetchFuturesPositions,
	fetchSpotOrdersByUser,
	fetchSpotPosition,
} from '../../../store/slices/tradingSlice'

export default function Type2() {
	const [primaryTab, setPrimaryTab] = useState(0) // 0 - BUY, 1 - SELL
	const [orderType, setOrderType] = useState('market') // 'market', 'limit', 'stop-limit'
	const [sliderValue, setSliderValue] = useState(0)
	const [leverage, setLeverage] = useState(1) // Левередж для фьючерсов
	const [limitPrice, setLimitPrice] = useState('')
	const [stopPrice, setStopPrice] = useState('')
	const [availablePosition, setAvailablePosition] = useState(0)

	const lastPrice = useSelector(state => state.symbol.lastPrice)
	const selectedSymbol = useSelector(state => state.symbol.selectedSymbol)
	const user = useSelector(state => state.auth.data)
	const spotPosition = useSelector(state => state.trading.spotPositions)
	const futuresPositions = useSelector(state => state.trading.futuresPositions)
	const dispatch = useDispatch()
	const location = useLocation()

	const isSpotTrading = location.pathname.includes('spot')
	const isFuturesTrading = location.pathname.includes('futures') // Проверка фьючерсной торговли
	const [baseCurrency, quoteCurrency] = selectedSymbol.split('-')

	useEffect(() => {
		if (isSpotTrading) {
			setAvailablePosition(
				spotPosition.find(p => p.symbol === selectedSymbol)?.quantity || 0
			)
		} else if (isFuturesTrading) {
			setAvailablePosition(
				futuresPositions?.find(p => p.symbol === selectedSymbol)?.quantity || 0
			)
		}
	}, [
		spotPosition,
		futuresPositions,
		selectedSymbol,
		isSpotTrading,
		isFuturesTrading,
	])

	const handlePrimaryTab = index => setPrimaryTab(index)
	const handleOrderTypeChange = type => setOrderType(type)
	const handleSliderChange = e => setSliderValue(e.target.value)
	const handleLimitPriceChange = e => setLimitPrice(e.target.value)
	const handleStopPriceChange = e => setStopPrice(e.target.value)

	const checkMainBalance = quantity =>
		user?.main_balance >= quantity * lastPrice
	const checkBalance = quantity =>
		primaryTab === 0
			? checkMainBalance(quantity)
			: availablePosition >= quantity

	const handleMarketOrder = useCallback(async () => {
		const quantity = sliderValue

		// Если это рыночный ордер, проверяем баланс пользователя
		if (primaryTab === 0 && orderType === 'market') {
			if (quantity <= 0 || !checkMainBalance(quantity)) {
				toast.error('Недостаточно средств или неверное количество.')
				return
			}
		} else if (primaryTab === 1 && orderType === 'market') {
			// Проверка для продажи на споте
			if (isSpotTrading && availablePosition < quantity) {
				toast.error('Недостаточно позиций для продажи.')
				return
			}
		}

		const orderSpot = {
			symbol: selectedSymbol,
			quantity,
			type: orderType,
			side: primaryTab === 0 ? 'buy' : 'sell',
			price:
				orderType === 'limit' || orderType === 'stop-limit'
					? limitPrice
					: undefined,
			stopPrice: orderType === 'stop-limit' ? stopPrice : undefined,
		}

		const order = {
			symbol: selectedSymbol,
			quantity,
			orderType: orderType,
			orderAction: primaryTab === 0 ? 'buy' : 'sell',
			price:
				orderType === 'limit' || orderType === 'stop-limit' ? limitPrice : 0,
			stopPrice: orderType === 'stop-limit' ? stopPrice : undefined,
		}

		try {
			if (isSpotTrading) {
				await dispatch(createSpotOrder(orderSpot)).unwrap()
				await dispatch(fetchSpotOrdersByUser())
				await dispatch(fetchSpotPosition())
			} else {
				await dispatch(
					createFuturesOrder({ ...order, leverage, userId: user.id })
				).unwrap()
				await dispatch(fetchFuturesOrders())
				await dispatch(fetchFuturesPositions())
			}
			toast.success('Order placed successfully!')
		} catch (error) {
			toast.error(`Error placing order: ${error.message}`)
		}
	}, [
		selectedSymbol,
		sliderValue,
		primaryTab,
		orderType,
		limitPrice,
		stopPrice,
		dispatch,
		isSpotTrading,
		leverage,
		availablePosition,
		user.id,
	])

	return (
		<div className='advance-card advance-card--type-2' data-aos='fade-up'>
			<div className='advance-card__title'>
				<h6 className='advance-card__title-text'>{selectedSymbol}</h6>
				<img
					src={`/images/icons/logo-${baseCurrency.toLowerCase()}.svg`}
					alt=''
					className='advance-card__title-image'
				/>
			</div>

			<div
				className='tabs btn-group btn-group-toggle d-flex'
				data-toggle='buttons'
			>
				<button
					onClick={() => handlePrimaryTab(0)}
					className={`btn w-100 ${
						primaryTab === 0 ? 'btn-success' : 'btn-outline-success'
					}`}
				>
					BUY
				</button>
				<button
					onClick={() => handlePrimaryTab(1)}
					className={`btn w-100 ${
						primaryTab === 1 ? 'btn-danger' : 'btn-outline-danger'
					}`}
				>
					SELL
				</button>
			</div>

			<div className='order-type-select mt-3'>
				<select
					className='form-select text-center'
					value={orderType}
					onChange={e => handleOrderTypeChange(e.target.value)} // Вызываем обработчик для изменения типа ордера
				>
					<option className='forms-select__items' value='market'>
						Market
					</option>
					<option className='forms-group__items' value='limit'>
						Limit
					</option>
					<option className='forms-group__items' value='stop-limit'>
						Stop-Limit
					</option>
				</select>
			</div>

			<div className='advance-card__form mt-3'>
				<div className='advance-card__form-title'>
					<p className='advance-card__form-title-text'>Amount</p>
				</div>
				<div className='forms-group'>
					<input
						type='number'
						min='0'
						value={sliderValue}
						onChange={handleSliderChange}
						className='form-control'
						placeholder='Enter amount'
					/>
				</div>
			</div>

			{orderType === 'limit' && (
				<div className='advance-card__form'>
					<div className='advance-card__form-title'>
						<p className='advance-card__form-title-text'>Limit Price</p>
					</div>
					<div className='forms-group'>
						<input
							type='number'
							min='0'
							value={limitPrice}
							onChange={handleLimitPriceChange}
							className='form-control'
							placeholder='Enter limit price'
						/>
					</div>
				</div>
			)}

			{orderType === 'stop-limit' && (
				<>
					<div className='advance-card__form'>
						<div className='advance-card__form-title'>
							<p className='advance-card__form-title-text'>Limit Price</p>
						</div>
						<div className='forms-group'>
							<input
								type='number'
								min='0'
								value={limitPrice}
								onChange={handleLimitPriceChange}
								className='form-control'
								placeholder='Enter limit price'
							/>
						</div>
					</div>
					<div className='advance-card__form'>
						<div className='advance-card__form-title'>
							<p className='advance-card__form-title-text'>Stop Price</p>
						</div>
						<div className='forms-group'>
							<input
								type='number'
								min='0'
								value={stopPrice}
								onChange={handleStopPriceChange}
								className='form-control'
								placeholder='Enter stop price'
							/>
						</div>
					</div>
				</>
			)}

			{isFuturesTrading && (
				<div className='advance-card__form mt-3'>
					<div className='advance-card__form-title'>
						<p className='advance-card__form-title-text'>Leverage</p>
					</div>
					<div className='forms-group'>
						<input
							type='range'
							min='1'
							max='100'
							value={leverage}
							onChange={e => setLeverage(e.target.value)}
							className='form-control'
						/>
						<span>{leverage}x</span>
					</div>
				</div>
			)}

			<div className='advance-card__buttons mt-4'>
				<button
					onClick={handleMarketOrder} // Вызываем функцию для рыночных ордеров
					className={`btn ${primaryTab === 0 ? 'btn-success' : 'btn-danger'}`}
				>
					{primaryTab === 0 ? 'Place Buy Order' : 'Place Sell Order'}
				</button>
			</div>
		</div>
	)
}
