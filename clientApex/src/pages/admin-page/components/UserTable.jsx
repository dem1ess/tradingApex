// UserTable.js
import React, { useEffect, useState } from 'react'
import { Button, Collapse, Container, Form, Table } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	fetchAllUsers,
	fetchUpdateUser,
} from '../../../store/slices/adminSlice'
import {
	fetchGetTransactionsByUser,
	fetchUpdateTransactionStatus,
} from '../../../store/slices/transactionSlice'
import UserEditModal from './UserEditModal'

const UserTable = () => {
	const [users, setUsers] = useState([])
	const [selectedUser, setSelectedUser] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [expandedUserId, setExpandedUserId] = useState(null)
	const [wallets, setWallets] = useState({})
	const dispatch = useDispatch()

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const data = await dispatch(fetchAllUsers())
				setUsers(data.payload)
			} catch (error) {
				console.error('Error fetching users:', error)
			}
		}

		fetchUsers()
	}, [dispatch])

	const handleUserClick = user => {
		setSelectedUser(user)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedUser(null)
		setExpandedUserId(null)
		dispatch(fetchAllUsers()).then(data => setUsers(data.payload))
	}

	const handleUpdateUser = updatedUser => {
		dispatch(fetchUpdateUser(updatedUser)).then(() => handleCloseModal())
	}

	const handleExpandClick = userId => {
		setExpandedUserId(expandedUserId === userId ? null : userId)
		dispatch(fetchGetTransactionsByUser(userId)).then(data => {
			setSelectedUser(prevState => ({
				...prevState,
				transactions: data.payload,
			}))
		})
	}

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
				handleExpandClick(selectedUser.id)
			})
			.catch(err =>
				toast.error(`Error updating ${transactionId}: ${err.message}`)
			)
	}

	const handleWalletChange = (transactionId, value) => {
		setWallets(prev => ({
			...prev,
			[transactionId]: value,
		}))
	}

	const handleCopyToClipboard = wallet => {
		navigator.clipboard
			.writeText(wallet)
			.then(() => toast.success('Crypto wallet copied!'))
			.catch(() => toast.error('Failed to copy to clipboard'))
	}

	return (
		<Container>
			<ToastContainer />
			<Table striped bordered hover variant='dark'>
				<thead>
					<tr>
						<th>ID</th>
						<th>Email</th>
						<th>First Name</th>
						<th>Last Name</th>
						<th>Country</th>
						<th>Main Balance</th>
						<th>Credit Balance</th>
						<th>Verified</th>
						<th>Wallet</th>
						<th>Banned</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{users.map(user => (
						<React.Fragment key={user.id}>
							<tr>
								<td>{user.id}</td>
								<td>{user.email}</td>
								<td>{user.first_name}</td>
								<td>{user.last_name}</td>
								<td>{user.country}</td>
								<td>{user.main_balance}</td>
								<td>{user.credit_balance}</td>
								<td>{user.is_verified ? 'Yes' : 'No'}</td>
								<td>{user.wallet || 'No Wallet'}</td>
								<td>{user.is_banned ? 'Yes' : 'No'}</td>
								<td>
									<Button
										variant='primary'
										size='sm'
										onClick={() => handleUserClick(user)}
									>
										Edit
									</Button>
									<Button
										variant='link'
										size='sm'
										onClick={() => handleExpandClick(user.id)}
										aria-expanded={expandedUserId === user.id}
									>
										{expandedUserId === user.id ? 'Hide' : 'Show'} Transactions
									</Button>
								</td>
							</tr>
							{expandedUserId === user.id && (
								<tr>
									<td colSpan='12'>
										<Collapse in={expandedUserId === user.id}>
											<div>
												<h5>User Transactions</h5>
												{selectedUser?.transactions &&
												selectedUser.transactions.length > 0 ? (
													<Table striped bordered hover variant='dark'>
														<thead>
															<tr>
																<th>ID</th>
																<th>Type</th>
																<th>Amount</th>
																<th>Status</th>
																<th>Crypto Wallet</th>
																<th>Actions</th>
															</tr>
														</thead>
														<tbody>
															{selectedUser.transactions.map(transaction => (
																<tr key={transaction.id}>
																	<td>{transaction.id}</td>
																	<td>{transaction.type}</td>
																	<td>{transaction.amount}</td>
																	<td>{transaction.status}</td>
																	<td>{transaction.crypto_wallet || 'N/A'}</td>
																	<td>
																		<Button
																			variant='outline-primary'
																			size='sm'
																			onClick={() =>
																				handleCopyToClipboard(
																					transaction.crypto_wallet
																				)
																			}
																		>
																			Copy Wallet
																		</Button>
																		{transaction.status === 'pending' && (
																			<>
																				<Button
																					variant='success'
																					size='sm'
																					className='mx-2'
																					onClick={() =>
																						handleStatusChange(
																							transaction.id,
																							'approved'
																						)
																					}
																				>
																					Approve
																				</Button>
																				<Button
																					variant='danger'
																					size='sm'
																					onClick={() =>
																						handleStatusChange(
																							transaction.id,
																							'rejected'
																						)
																					}
																				>
																					Reject
																				</Button>
																				<Form.Control
																					type='text'
																					placeholder='New Wallet'
																					value={wallets[transaction.id] || ''}
																					onChange={e =>
																						handleWalletChange(
																							transaction.id,
																							e.target.value
																						)
																					}
																					size='sm'
																					className='mt-2'
																					style={{
																						backgroundColor: '#333',
																						color: '#fff',
																					}}
																				/>
																			</>
																		)}
																	</td>
																</tr>
															))}
														</tbody>
													</Table>
												) : (
													<p>No transactions available.</p>
												)}
											</div>
										</Collapse>
									</td>
								</tr>
							)}
						</React.Fragment>
					))}
				</tbody>
			</Table>

			<UserEditModal
				user={selectedUser}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				handleUpdateUser={handleUpdateUser}
			/>
		</Container>
	)
}

export default UserTable
