import QRCode from 'qrcode.react'
import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchCreateTransaction } from '../../../store/slices/transactionSlice'

export default function Type3v1({ selectedWallet, walletData }) {
	const dispatch = useDispatch()
	const user = useSelector(state => state.auth.data)
	const userId = user?.id
	const prices = useSelector(state => state.prices.prices || [])
	const spotPositions = useSelector(state => state.trading.spotPositions || []) // Получаем позиции

	// States for the modal window and notifications
	const [showModal, setShowModal] = useState(false)
	const [transactionType, setTransactionType] = useState('') // 'deposit' or 'withdrawal'
	const [amount, setAmount] = useState('')

	// Wallet address (assuming it's present in walletData)
	const walletAddress = walletData?.address

	if (!walletData) {
		return null // If there's no data, display nothing
	}

	// Функция для получения количества по тикеру из spotPositions
	const getQuantityForTicker = ticker => {
		const symbol = `${ticker}-USD`
		const position = spotPositions.find(pos => pos.symbol === symbol)
		return position ? position.quantity : 0
	}

	// Вместо walletData.amount используем позиции
	const balance = getQuantityForTicker(selectedWallet)

	// Map tickers if necessary (e.g., 'BNB20' to 'BNB')
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
		// Add other mappings if needed
	}

	// Get the base ticker to match with price data
	const baseTicker = symbolTickerMap[selectedWallet] || selectedWallet
	const symbol = `${baseTicker}-USD`

	// Find the price data for the selected wallet
	const priceData = prices.find(price => price.symbol === symbol)
	const price = priceData?.price || null

	// Calculate USD values using the actual price
	const usdValue = price ? (balance * price).toFixed(2) : null
	const exchangeBalance = (balance * 0.5).toFixed(4) // Adjust as needed
	const exchangeUsd = price ? (exchangeBalance * price).toFixed(2) : null

	const handleWithdrawClick = () => {
		setTransactionType('withdrawal') // Use 'withdrawal' to match server-side expectations
		setShowModal(true)
		setAmount('')
	}

	const handleDepositClick = () => {
		setTransactionType('deposit')
		setShowModal(true)
		setAmount('')
	}

	const handleCopyAddress = () => {
		navigator.clipboard.writeText(walletAddress)
		toast.success('Wallet address copied to clipboard!')
	}

	const handleCreateTransaction = async () => {
		if (!amount || isNaN(amount) || Number(amount) <= 0) {
			toast.error('Please enter a valid amount.')
			return
		}

		try {
			await dispatch(
				fetchCreateTransaction({
					userId,
					type: transactionType,
					amount: parseFloat(amount),
					cryptoWallet: walletAddress,
					walletTicker: selectedWallet,
				})
			).unwrap()

			toast.success(
				`${
					transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'
				} transaction successfully created!`
			)

			setShowModal(false)
		} catch (err) {
			toast.error('Error creating transaction.')
		}
	}

	return (
		<>
			<div className='advance-card advance-card--type-3-v1' data-aos='fade-up'>
				<div className='advance-card__title'>
					<img
						src={`/images/icons/logo-${selectedWallet.toLowerCase()}.svg`}
						alt=''
						className='advance-card__title-image'
					/>
					<h6 className='advance-card__title-text'>{selectedWallet}</h6>
				</div>
				<div className='advance-card__balance'>
					<p className='advance-card__balance-title'>Total Balance</p>
					<p className='advance-card__balance-crypto-value'>{balance}</p>
					<p className='advance-card__balance-currency-value'>
						{price ? `${usdValue} USD` : 'Price not available'}
					</p>
				</div>
				<div className='advance-card__card'>
					<div className='advance-card__card-desc'>
						<p className='advance-card__card-desc-title'>Exchange Balance</p>
						<div className='advance-card__card-desc-value'>
							<p className='advance-card__card-desc-value-crypto'>
								{exchangeBalance}
							</p>
							<p className='advance-card__card-desc-value-currency'>
								{price ? `${exchangeUsd} USD` : 'Price not available'}
							</p>
						</div>
					</div>
					<div className='advance-card__card-chart-wrapper'>
						<div
							id='advance-card__card-radial-1'
							className='advance-card__card-chart-render'
						></div>
					</div>
				</div>
				<div className='advance-card__buttons'>
					<button
						className='btn btn-primary advance-card__button btn-sm btn-pill'
						onClick={handleWithdrawClick}
					>
						Withdraw
					</button>
					<button
						className='btn btn-secondary advance-card__button btn-sm'
						onClick={handleDepositClick}
					>
						Deposit
					</button>
				</div>
			</div>

			{/* Modal window */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}{' '}
						{selectedWallet}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className='text-center'>
						<p>Scan the QR code or copy the wallet address below:</p>
						<div
							style={{
								display: 'inline-block',
								padding: '10px',
								backgroundColor: '#f1f1f1',
								borderRadius: '8px',
							}}
						>
							<QRCode value={walletAddress} size={200} />
						</div>
						<div
							style={{
								marginTop: '20px',
								wordBreak: 'break-all',
								cursor: 'pointer',
								padding: '10px',
							}}
							onClick={handleCopyAddress}
						>
							{walletAddress}
						</div>
						<p style={{ marginTop: '10px', fontSize: '14px', color: 'gray' }}>
							Click on the address to copy
						</p>
					</div>
					<div style={{ marginTop: '20px' }}>
						<label htmlFor='amountInput'>Enter amount:</label>
						<input
							type='number'
							id='amountInput'
							className='form-control'
							value={amount}
							onChange={e => setAmount(e.target.value)}
							placeholder='Amount'
							min='0'
							step='any'
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={() => setShowModal(false)}>
						Close
					</Button>
					<Button variant='primary' onClick={handleCreateTransaction}>
						Confirm
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}
