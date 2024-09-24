import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchGetTransactionsByUser } from '../../../store/slices/transactionSlice'

export default function Type5V1() {
	const [selectedDay, setSelectedDay] = useState('all')
	const transactions = useSelector(state => state.transaction.transactions)
	const dispatch = useDispatch()
	const userId = useSelector(state => state.auth?.data?.id)

	const filterTransactions = day => {
		const now = new Date()
		const startDate = new Date()
		const endDate = new Date()

		if (day === 'yesterday') {
			startDate.setDate(now.getDate() - 1)
			startDate.setHours(0, 0, 0, 0)
			endDate.setDate(now.getDate() - 1)
			endDate.setHours(23, 59, 59, 999)
		} else if (day === 'today') {
			startDate.setHours(0, 0, 0, 0)
			endDate.setHours(23, 59, 59, 999)
		} else if (day === 'all') {
			return transactions
		}

		return transactions.filter(transaction => {
			const transactionDate = new Date(transaction.created_at)
			return transactionDate >= startDate && transactionDate <= endDate
		})
	}

	useEffect(() => {
		if (userId) {
			dispatch(fetchGetTransactionsByUser(userId))
		}
	}, [dispatch, userId])

	const handleCopyId = id => {
		navigator.clipboard.writeText(id)
		toast.success('Transaction ID copied to clipboard!')
	}

	const getStatus = status => {
		const styles = {
			green: { color: 'green' },
			red: { color: 'red' },
			gray: { color: 'gray' },
		}

		if (status === 'approved') {
			return <span style={styles.green}>Finished</span>
		}

		if (status === 'rejected') {
			return <span style={styles.red}>Failed</span>
		}

		return <span style={styles.gray}>Waiting</span>
	}

	const filteredTransactions = filterTransactions(selectedDay)

	return (
		<div className='standard-card standard-card--type-5-v1' data-aos='fade-up'>
			<div className='container'>
				<div className='standard-card__head'>
					<h6 className='standard-card__title'>Transaction</h6>
					<div className='dropdown'>
						<button
							className='btn btn-secondary dropdown-toggle dropdown-toggle--card-type-5'
							type='button'
							id='dropdownMenuButton1'
							data-bs-toggle='dropdown'
							aria-expanded='false'
						>
							{selectedDay === 'all'
								? 'All Time'
								: selectedDay === 'today'
								? 'Today'
								: 'Yesterday'}
							<img src='/images/icons/arrow-down.svg' alt='' />
						</button>
						<ul className='dropdown-menu' aria-labelledby='dropdownMenuButton1'>
							<li>
								<button
									className='dropdown-item'
									onClick={() => setSelectedDay('all')}
								>
									All Time
								</button>
							</li>
							<li>
								<button
									className='dropdown-item'
									onClick={() => setSelectedDay('yesterday')}
								>
									Yesterday
								</button>
							</li>
							<li>
								<button
									className='dropdown-item'
									onClick={() => setSelectedDay('today')}
								>
									Today
								</button>
							</li>
						</ul>
					</div>
				</div>

				<div className='standard-card__content'>
					{filteredTransactions && filteredTransactions.length > 0 ? (
						filteredTransactions.map(transaction => {
							const date = new Date(transaction.created_at)
							const formattedDate = date.toLocaleString()
							const shortId = transaction.id.slice(0, 8) + '...'

							// Изменено для динамического отображения тикера кошелька
							const walletTicker = transaction.wallet_ticker || 'BTC' // По умолчанию BTC, если нет тикера

							return (
								<div
									className='standard-card__content__list'
									key={transaction.id}
								>
									<div className='standard-card__content__list-icon'>
										<img
											src={
												transaction.type === 'deposit'
													? '/images/icons/transaction-arrow-green.svg'
													: '/images/icons/transaction-arrow-red.svg'
											}
											alt=''
											className='standard-card__content__list-icon-image'
										/>
									</div>
									<div className='standard-card__content__list-info-left'>
										<p className='standard-card__content__list-info-date'>
											{formattedDate}
										</p>
										<p className='standard-card__content__list-info-status'>
											{getStatus(transaction.status)}
										</p>
									</div>
									<div className='standard-card__content__list-info-right'>
										<p className='standard-card__content__list-info-price'>
											<span className='standard-card__content__list-info-price-value'>
												{transaction.amount || '0.00'}
											</span>{' '}
											{walletTicker}{' '}
											{/* Отображение валюты вместо фиксированного "BTC" */}
										</p>
										<p
											className='standard-card__content__list-info-id'
											style={{ cursor: 'pointer' }}
											onClick={() => handleCopyId(transaction.id)} // Копирование при клике
										>
											ID: {shortId}
										</p>
									</div>
								</div>
							)
						})
					) : (
						<p>No transactions found.</p>
					)}
				</div>

				<div className='standard-card__vignette'></div>
			</div>
		</div>
	)
}
