/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { closeFuturesPosition } from '../../store/slices/tradingSlice'
import PositionModal from './PositionModal'

const FuturesPositionRow = ({ position }) => {
	const dispatch = useDispatch()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [closeQuantity, setCloseQuantity] = useState(position.quantity)
	const [manualQuantity, setManualQuantity] = useState(position.quantity)
	const [orderType, setOrderType] = useState('market')
	const [limitPrice, setLimitPrice] = useState('')

	const handleOpenModal = () => {
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setOrderType('market')
		setLimitPrice('')
	}

	const handleClosePosition = () => {
		if (orderType === 'limit' && (!limitPrice || limitPrice <= 0)) {
			console.error('Please enter a valid limit price')
			return
		}

		const data = {
			symbol: position.symbol,
			quantity: closeQuantity,
			closePrice: orderType === 'limit' ? limitPrice : null,
		}
		dispatch(closeFuturesPosition(data)).then(response => {
			if (response.meta.requestStatus === 'fulfilled') {
				console.log('Position closed successfully')
			} else {
				console.error('Error closing position')
			}
		})
		handleCloseModal()
	}

	const handlePercentageClick = percentage => {
		const newQuantity = (position.quantity * (percentage / 100)).toFixed(2)
		setCloseQuantity(newQuantity)
		setManualQuantity(newQuantity)
	}

	const handleManualQuantityChange = e => {
		const value = e.target.value
		if (!isNaN(value) && value >= 0) {
			setManualQuantity(value)
			setCloseQuantity(value)
		}
	}

	const handleOrderTypeChange = type => {
		setOrderType(type)
	}

	const handleLimitPriceChange = e => {
		setLimitPrice(e.target.value)
	}

	const entry_price = parseFloat(position.entry_price).toFixed(2)

	return (
		<>
			<tr className='table-row'>
				<td className='fb-regular'>
					<p>{position.symbol}</p>
				</td>
				<td className='table__head'>
					<p>{position.quantity}</p>
				</td>
				<td className='table__head'>
					<p>{entry_price}</p>
				</td>
				<td className='table__head'>
					<p>{position.leverage}</p>
				</td>
				<td className='table__head'>
					<p>{position.position_type}</p>
				</td>
				<td className='table__head'>
					<p>{position.status}</p>
				</td>
				<td className='table__head'>
					<button onClick={handleOpenModal} className='btn btn-danger'>
						Close
					</button>
				</td>
			</tr>

			{isModalOpen && (
				<PositionModal onClose={handleCloseModal}>
					<h3 className='modal-title'>Close Position</h3>
					<p className='modal-info'>{position.symbol}</p>
					<p className='modal-info'>
						Select how much of the position you want to close:
					</p>
					<div className='modal-buttons d-flex justify-content-around flex-wrap'>
						{[10, 25, 50, 75, 100].map(percentage => (
							<button
								key={percentage}
								onClick={() => handlePercentageClick(percentage)}
								className='btn btn-primary m-1' // Добавьте отступы вокруг каждой кнопки
							>
								{percentage}%
							</button>
						))}
					</div>
					<div className='modal-input'>
						<label htmlFor='manual-quantity'>Or enter quantity manually:</label>
						<input
							type='number'
							id='manual-quantity'
							value={manualQuantity}
							onChange={handleManualQuantityChange}
							className='form-control'
							min='0'
							step='any'
						/>
					</div>
					<div className='modal-input'>
						<label>Select order type:</label>
						<div className='modal-buttons d-flex justify-content-around'>
							<button
								onClick={() => handleOrderTypeChange('market')}
								className={`btn ${
									orderType === 'market' ? 'btn-success' : 'btn-secondary'
								}`}
							>
								Market Order
							</button>
							<button
								onClick={() => handleOrderTypeChange('limit')}
								className={`btn ${
									orderType === 'limit' ? 'btn-success' : 'btn-secondary'
								}`}
							>
								Limit Order
							</button>
						</div>
					</div>
					{orderType === 'limit' && (
						<div className='modal-input'>
							<label htmlFor='limit-price'>Enter limit price:</label>
							<input
								type='number'
								id='limit-price'
								value={limitPrice}
								onChange={handleLimitPriceChange}
								className='form-control'
								min='0'
								step='any'
							/>
						</div>
					)}
					<p className='modal-info'>
						Closing {closeQuantity} out of {position.quantity} units.
					</p>
					<div className='modal-buttons d-flex justify-content-around'>
						<button onClick={handleClosePosition} className='btn btn-success'>
							Confirm
						</button>
						<button onClick={handleCloseModal} className='btn btn-secondary'>
							Cancel
						</button>
					</div>
				</PositionModal>
			)}
		</>
	)
}

export default FuturesPositionRow
