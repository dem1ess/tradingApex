import moment from 'moment' // Для форматирования даты
import { useEffect, useState } from 'react'
import {
	Button,
	Card,
	Col,
	Container,
	Form,
	ListGroup,
	Modal,
	Row,
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import {
	addOrder,
	fetchOrdersByRobot,
	fetchRobots,
} from '../../../store/slices/robotSlice'

const RobotList = () => {
	const dispatch = useDispatch()
	const robots = useSelector(state => state.robots.robots)
	const ordersByRobot = useSelector(state => state.robots.ordersByRobot)

	const [showModal, setShowModal] = useState(false)
	const [selectedRobotId, setSelectedRobotId] = useState(null)
	const [orderData, setOrderData] = useState({
		type: '',
		price: '',
	})

	// Загружаем данные о роботах и ордерах
	useEffect(() => {
		const loadData = async () => {
			await dispatch(fetchRobots())
			robots.forEach(robot => {
				dispatch(fetchOrdersByRobot(robot.id))
			})
		}
		loadData()
	}, [dispatch])

	// Открытие модального окна для добавления ордера
	const handleShowModal = robotId => {
		setSelectedRobotId(robotId) // Устанавливаем выбранный robotId
		setShowModal(true)
	}

	// Закрытие модального окна
	const handleCloseModal = () => {
		setShowModal(false)
		setOrderData({ type: '', price: '' }) // Очищаем данные формы
	}

	// Обработка изменений в полях формы
	const handleInputChange = e => {
		const { name, value } = e.target
		setOrderData(prevData => ({ ...prevData, [name]: value }))
	}

	// Добавление ордера
	const handleAddOrder = async () => {
		if (!selectedRobotId || !orderData.type || !orderData.price) return

		// Передаем robotId автоматически при добавлении ордера
		await dispatch(addOrder({ ...orderData, robotId: selectedRobotId }))
		await dispatch(fetchOrdersByRobot(selectedRobotId)) // Обновляем список ордеров
		handleCloseModal()
	}

	// Рассчитываем разницу между последней покупкой и продажей
	const calculateDifference = (buyOrders, sellOrders) => {
		if (buyOrders.length === 0 || sellOrders.length === 0) return 0
		const lastBuyPrice = parseFloat(buyOrders[buyOrders.length - 1].price)
		const lastSellPrice = parseFloat(sellOrders[sellOrders.length - 1].price)
		return lastSellPrice - lastBuyPrice
	}

	return (
		<Container
			style={{ backgroundColor: '#1a1a1a', color: '#ffffff', padding: '2rem' }}
		>
			<h1 className='my-4'>Robot List</h1>
			<Row>
				{robots.map(robot => {
					const buyOrders = (ordersByRobot[robot.id] || []).filter(
						order => order.type === 'buy'
					)
					const sellOrders = (ordersByRobot[robot.id] || []).filter(
						order => order.type === 'sell'
					)
					const priceDifference = calculateDifference(buyOrders, sellOrders)

					return (
						<Col md={4} key={robot.id}>
							<Card className='mb-4' bg='dark' text='white'>
								<Card.Body>
									<Card.Title>{robot.name}</Card.Title>
									<Card.Text>{robot.description}</Card.Text>
									<ListGroup className='mb-3' variant='flush'>
										<ListGroup.Item
											style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
										>
											Daily Percentage: {robot.daily_percentage}%
										</ListGroup.Item>
										<ListGroup.Item
											style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
										>
											Weekly Percentage: {robot.weekly_percentage}%
										</ListGroup.Item>
										<ListGroup.Item
											style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
										>
											Price Difference: ${priceDifference.toFixed(2)}
										</ListGroup.Item>
									</ListGroup>
									<Button
										variant='primary'
										onClick={() => handleShowModal(robot.id)}
									>
										Add Order
									</Button>

									{/* Отображение списка ордеров */}
									{ordersByRobot[robot.id] && (
										<div className='mt-3'>
											<h5>Orders:</h5>
											<ListGroup variant='flush'>
												{ordersByRobot[robot.id].map((order, index) => {
													// Устанавливаем цвет в зависимости от статуса
													const orderStyle =
														order.status === 'completed'
															? {
																	backgroundColor: '#2a2a2a',
																	color: '#a9a9a9', // Серый цвет для завершенных ордеров
																	border: '1px solid #444',
																	marginBottom: '0.5rem',
																	borderRadius: '8px',
															  }
															: {
																	backgroundColor: '#2a2a2a',
																	color: '#fff', // Белый для активных
																	border: '1px solid #333',
																	marginBottom: '0.5rem',
																	borderRadius: '8px',
															  }

													return (
														<ListGroup.Item key={index} style={orderStyle}>
															<div>
																<strong>{order.type}</strong> at $
																{parseFloat(order.price).toFixed(2)}
															</div>
															<div>
																<small>
																	Created at:{' '}
																	{moment(order.created_at).format(
																		'MMMM Do YYYY, h:mm:ss a'
																	)}
																</small>
															</div>
														</ListGroup.Item>
													)
												})}
											</ListGroup>
										</div>
									)}
								</Card.Body>
							</Card>
						</Col>
					)
				})}
			</Row>

			{/* Модальное окно для добавления ордера */}
			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Add Order</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group controlId='type'>
							<Form.Label>Order Type</Form.Label>
							<Form.Control
								as='select'
								name='type'
								value={orderData.type}
								onChange={handleInputChange}
							>
								<option value=''>Select Type</option>
								<option value='buy'>Buy</option>
								<option value='sell'>Sell</option>
							</Form.Control>
						</Form.Group>
						<Form.Group controlId='price'>
							<Form.Label>Price</Form.Label>
							<Form.Control
								type='number'
								name='price'
								value={orderData.price}
								onChange={handleInputChange}
							/>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={handleCloseModal}>
						Close
					</Button>
					<Button variant='primary' onClick={handleAddOrder}>
						Add Order
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	)
}

export default RobotList
