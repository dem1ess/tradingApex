// AdminTransactions.js
import React, { useContext, useEffect, useState } from 'react'
import { Button, Container, Form, Spinner, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	fetchGetAllTransactions,
	fetchUpdateTransactionStatus,
} from '../../../store/slices/transactionSlice'
import { copyToClipboard } from '../../../utils/clipboardUtils'
import ThemeContext from '../ThemeContext'

const AdminTransactions = () => {
	const { theme } = useContext(ThemeContext)
	const dispatch = useDispatch()
	const { transactions, status, error } = useSelector(
		state => state.transaction
	)
	const [wallets, setWallets] = useState({})

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchGetAllTransactions())
		}
	}, [status, dispatch])

	const handleStatusChange = (transactionId, newStatus) => {
		const newCryptoWallet = wallets[transactionId] || ''
		dispatch(
			fetchUpdateTransactionStatus({
				transactionId,
				status: newStatus,
				newCryptoWallet,
			})
		)
			.then(() => {
				toast.success(`Transaction ${transactionId} ${newStatus}`)
			})
			.catch(err => {
				toast.error(`Error updating ${transactionId}: ${err.message}`)
			})
		dispatch(fetchGetAllTransactions())
	}

	const handleWalletChange = (transactionId, value) => {
		setWallets(prev => ({
			...prev,
			[transactionId]: value,
		}))
	}

	const handleCopyToClipboard = wallet => {
		copyToClipboard(wallet)
		toast.success('Crypto wallet copied to clipboard!')
	}

	return (
		<Container
			className='p-4'
			style={
				theme === 'dark'
					? { backgroundColor: '#1a1a1a', color: '#ffffff' }
					: { backgroundColor: '#ffffff', color: '#000000' }
			}
		>
			<ToastContainer />
			<h1 className='mb-4'>Manage Transactions</h1>
			{status === 'loading' && (
				<Spinner
					animation='border'
					variant={theme === 'dark' ? 'light' : 'dark'}
				/>
			)}
			{error && <p className='text-danger'>Error: {error}</p>}
			{status === 'succeeded' && transactions.length === 0 && (
				<p>No transactions available.</p>
			)}
			{status === 'succeeded' && transactions.length > 0 && (
				<Table striped bordered hover variant={theme}>
					<thead>
						<tr>
							<th>ID</th>
							<th>User ID</th>
							<th>Type</th>
							<th>Amount</th>
							<th>Status</th>
							<th>Crypto Wallet</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map(transaction => (
							<tr key={transaction.id}>
								<td>{transaction.id}</td>
								<td>{transaction.user_id}</td>
								<td>{transaction.type}</td>
								<td>{transaction.amount}</td>
								<td>{transaction.status}</td>
								<td>
									{transaction.crypto_wallet || 'N/A'}
									{transaction.crypto_wallet && (
										<Button
											variant='primary'
											size='sm'
											className='ml-2'
											onClick={() =>
												handleCopyToClipboard(transaction.crypto_wallet)
											}
										>
											Copy
										</Button>
									)}
								</td>
								<td>
									{transaction.status === 'pending' && (
										<>
											<Button
												variant='success'
												size='sm'
												className='mr-2'
												onClick={() =>
													handleStatusChange(transaction.id, 'approved')
												}
											>
												Approve
											</Button>
											<Button
												variant='danger'
												size='sm'
												onClick={() =>
													handleStatusChange(transaction.id, 'rejected')
												}
											>
												Reject
											</Button>
											<Form.Control
												type='text'
												placeholder='New Crypto Wallet'
												value={wallets[transaction.id] || ''}
												onChange={e =>
													handleWalletChange(transaction.id, e.target.value)
												}
												className='mt-2'
												style={
													theme === 'dark'
														? { backgroundColor: '#333', color: '#fff' }
														: { backgroundColor: '#fff', color: '#000' }
												}
											/>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
		</Container>
	)
}

export default AdminTransactions
