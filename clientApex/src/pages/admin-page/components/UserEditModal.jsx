/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react'
import { Button, Form, ListGroup, Modal, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUpdateUser } from '../../../store/slices/adminSlice' // Импортируем экшен для обновления пользователя
import {
	fetchGetNotifications,
	fetchSendNotification,
} from '../../../store/slices/notificationSlice'
import ThemeContext from '../ThemeContext'

const UserEditModal = ({ user, isOpen, onClose }) => {
	const { theme } = useContext(ThemeContext)
	const [userData, setUserData] = useState({
		email: '',
		first_name: '',
		last_name: '',
		country: '',
		main_balance: '',
		credit_balance: '',
		wallets: '',
		is_verified: false,
		is_banned: false,
	})
	const [notificationMessage, setNotificationMessage] = useState('')
	const dispatch = useDispatch()

	// Fetch notifications from Redux store
	const notifications = useSelector(state => state.notifications.notifications)
	const notificationStatus = useSelector(state => state.notifications.status)
	const notificationError = useSelector(state => state.notifications.error)

	useEffect(() => {
		if (user) {
			setUserData({
				id: user.id, // Важно передать id пользователя для обновления
				email: user.email || '',
				first_name: user.first_name || '',
				last_name: user.last_name || '',
				country: user.country || '',
				main_balance: user.main_balance || '',
				credit_balance: user.credit_balance || '',
				wallets: user.wallets || '',
				is_verified: user.is_verified || false,
				is_banned: user.is_banned || false,
			})
			// Fetch user notifications when modal opens
			dispatch(fetchGetNotifications(user.id))
		}
	}, [user, dispatch])

	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setUserData({
			...userData,
			[name]: type === 'checkbox' ? checked : value,
		})
	}

	const handleSave = () => {
		dispatch(fetchUpdateUser(userData)) // Отправляем обновленные данные пользователя
		onClose() // Закрываем модальное окно после сохранения
	}

	const handleSendNotification = () => {
		if (notificationMessage.trim()) {
			dispatch(
				fetchSendNotification({ userId: user.id, message: notificationMessage })
			)
				.then(() => {
					setNotificationMessage('')
					// Refresh notifications after sending a new one
					dispatch(fetchGetNotifications(user.id))
				})
				.catch(err => {
					console.error('Error sending notification:', err)
				})
		}
	}

	if (!user) {
		return null // Don't render modal if user is not provided
	}

	return (
		<Modal show={isOpen} onHide={onClose} size='lg' centered>
			<Modal.Header
				closeButton
				className={theme === 'dark' ? 'bg-dark text-white' : ''}
			>
				<Modal.Title>Edit User</Modal.Title>
			</Modal.Header>
			<Modal.Body className={theme === 'dark' ? 'bg-dark text-white' : ''}>
				<Form>
					{/* Existing form fields */}
					<Form.Group controlId='email'>
						<Form.Label>Email</Form.Label>
						<Form.Control
							type='email'
							name='email'
							value={userData.email}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='first_name'>
						<Form.Label>First Name</Form.Label>
						<Form.Control
							type='text'
							name='first_name'
							value={userData.first_name}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='last_name'>
						<Form.Label>Last Name</Form.Label>
						<Form.Control
							type='text'
							name='last_name'
							value={userData.last_name}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='country'>
						<Form.Label>Country</Form.Label>
						<Form.Control
							type='text'
							name='country'
							value={userData.country}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='main_balance'>
						<Form.Label>Main Balance</Form.Label>
						<Form.Control
							type='text'
							name='main_balance'
							value={userData.main_balance}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='credit_balance'>
						<Form.Label>Credit Balance</Form.Label>
						<Form.Control
							type='text'
							name='credit_balance'
							value={userData.credit_balance}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='is_verified'>
						<Form.Check
							type='checkbox'
							label='Verified'
							name='is_verified'
							checked={userData.is_verified}
							onChange={handleChange}
						/>
					</Form.Group>
					<Form.Group controlId='is_banned'>
						<Form.Check
							type='checkbox'
							label='Banned'
							name='is_banned'
							checked={userData.is_banned}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Notifications Section */}
					<h5 className='mt-4'>User Notifications</h5>
					{notificationStatus === 'loading' && (
						<div className='text-center'>
							<Spinner
								animation='border'
								variant={theme === 'dark' ? 'light' : 'primary'}
							/>
						</div>
					)}
					{notificationStatus === 'failed' && (
						<p className='text-danger'>Error: {notificationError}</p>
					)}
					{notifications.length > 0 ? (
						<ListGroup className='mb-3'>
							{notifications.map(notification => (
								<ListGroup.Item
									key={notification.id}
									className={theme === 'dark' ? 'bg-secondary text-white' : ''}
								>
									{notification.message}
									<span className='text-muted' style={{ float: 'right' }}>
										{new Date(notification.created_at).toLocaleString()}
									</span>
								</ListGroup.Item>
							))}
						</ListGroup>
					) : (
						<p>No notifications found for this user.</p>
					)}

					{/* Send Notification */}
					<Form.Group controlId='notificationMessage'>
						<Form.Label>Send Notification</Form.Label>
						<Form.Control
							type='text'
							value={notificationMessage}
							onChange={e => setNotificationMessage(e.target.value)}
							placeholder='Enter your message'
						/>
					</Form.Group>
					<Button
						variant='info'
						className='mt-2'
						onClick={handleSendNotification}
						disabled={notificationStatus === 'loading'}
					>
						Send Notification
					</Button>
				</Form>
			</Modal.Body>
			<Modal.Footer className={theme === 'dark' ? 'bg-dark text-white' : ''}>
				<Button variant='secondary' onClick={onClose}>
					Close
				</Button>
				<Button variant='primary' onClick={handleSave}>
					Save Changes
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default UserEditModal
