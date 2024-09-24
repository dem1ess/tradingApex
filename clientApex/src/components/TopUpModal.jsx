/* eslint-disable react/prop-types */
import { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchCreateTransaction } from '../store/slices/transactionSlice'

export default function TopUpModal({ show, handleClose }) {
	const dispatch = useDispatch()
	const prices = useSelector(state => state.prices.prices || [])
	const spotPositions = useSelector(state => state.trading.spotPositions || [])
	const user = useSelector(state => state.auth.data)
	const userId = user?.id

	const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'crypto'
	const [cryptoTicker, setCryptoTicker] = useState('')
	const [amountUSD, setAmountUSD] = useState('')
	const [cryptoAmount, setCryptoAmount] = useState('')

	// Получение цены для выбранного тикера
	const getPriceForTicker = ticker => {
		const priceData = prices.find(price => price.symbol === `${ticker}-USD`)
		return priceData ? priceData.price : null
	}

	// Получение доступного баланса для выбранного криптовалютного актива
	const getBalanceForTicker = ticker => {
		const position = spotPositions.find(pos => pos.symbol === `${ticker}-USD`)
		return position ? position.quantity : 0
	}

	// Обработка выбора метода оплаты
	const handlePaymentMethodChange = e => {
		setPaymentMethod(e.target.value)
		setCryptoTicker('') // Сброс тикера при изменении метода
		setCryptoAmount('')
	}

	// Обработка изменения суммы в USD
	const handleAmountUSDChange = e => {
		setAmountUSD(e.target.value)

		if (paymentMethod === 'crypto' && cryptoTicker) {
			const price = getPriceForTicker(cryptoTicker)
			if (price) {
				const amountInCrypto = parseFloat(e.target.value) / price
				setCryptoAmount(amountInCrypto.toFixed(6))
			}
		}
	}

	// Обработка выбора криптовалюты
	const handleCryptoChange = e => {
		const ticker = e.target.value
		setCryptoTicker(ticker)

		const price = getPriceForTicker(ticker)
		if (price && amountUSD) {
			const amountInCrypto = parseFloat(amountUSD) / price
			setCryptoAmount(amountInCrypto.toFixed(6))
		} else {
			setCryptoAmount('')
		}
	}

	// Создание транзакции
	const handleTopUp = async () => {
		if (!amountUSD || isNaN(amountUSD) || Number(amountUSD) <= 0) {
			toast.error('Please enter a valid amount in USD.')
			return
		}

		const transactionDetails = {
			userId,
			type: 'deposit',
			amount: parseFloat(amountUSD),
			method: paymentMethod === 'card' ? 'Card' : 'Crypto',
			cryptoWallet: paymentMethod === 'crypto' ? cryptoTicker : null,
		}

		try {
			await dispatch(fetchCreateTransaction(transactionDetails)).unwrap()
			toast.success('Deposit transaction successfully created!')
			handleClose() // Закрытие модального окна
		} catch (error) {
			toast.error('Error creating deposit transaction.')
		}
	}

	return (
		<Modal show={show} onHide={handleClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Top Up Account</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					{/* Выбор метода оплаты */}
					<Form.Group>
						<Form.Label style={{ color: 'white' }}>
							Select Payment Method
						</Form.Label>
						<Form.Control
							as='select'
							value={paymentMethod}
							onChange={handlePaymentMethodChange}
						>
							<option value='card'>Card</option>
							<option value='crypto'>Cryptocurrency</option>
						</Form.Control>
					</Form.Group>

					{/* Ввод суммы в USD */}
					<Form.Group>
						<Form.Label style={{ color: 'white' }}>Amount in USD</Form.Label>
						<Form.Control
							type='number'
							placeholder='Enter amount in USD'
							value={amountUSD}
							onChange={handleAmountUSDChange}
						/>
					</Form.Group>

					{/* Выбор криптовалюты при оплате криптовалютой */}
					{paymentMethod === 'crypto' && (
						<>
							<Form.Group>
								<Form.Label style={{ color: 'white' }}>
									Select Cryptocurrency
								</Form.Label>
								<Form.Control
									as='select'
									value={cryptoTicker}
									onChange={handleCryptoChange}
								>
									<option value=''>Select a cryptocurrency</option>
									{spotPositions.map(pos => (
										<option key={pos.symbol} value={pos.symbol.split('-')[0]}>
											{pos.symbol.split('-')[0]} (Balance:{' '}
											{getBalanceForTicker(pos.symbol.split('-')[0])})
										</option>
									))}
								</Form.Control>
							</Form.Group>

							{/* Отображение количества криптовалюты для пополнения */}
							{cryptoAmount && (
								<div className='crypto-amount'>
									<p>
										You will deposit approximately {cryptoAmount} {cryptoTicker}
										.
									</p>
								</div>
							)}
						</>
					)}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant='secondary' onClick={handleClose}>
					Close
				</Button>
				<Button variant='primary' onClick={handleTopUp}>
					Confirm
				</Button>
			</Modal.Footer>
		</Modal>
	)
}
