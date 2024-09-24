/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { checkUserConnected, connectRobot } from '../store/slices/robotSlice' // Импорт действий

export default function RobotItem({
	robot = {
		id: 'default-id',
		symbol: 'BTC',
		description: 'Bitcoin',
		robot_type: 'Trading',
		roi: '0.0',
		daily_percentage: '0.0',
		weekly_percentage: '0.0',
		min_investment: '100',
	},
}) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [investmentAmount, setInvestmentAmount] = useState('') // Состояние для суммы инвестиций
	const [period, setPeriod] = useState('daily') // Период (дневной или недельный)
	const [endDate, setEndDate] = useState(null) // Дата окончания подключения
	const [userProfit, setUserProfit] = useState(0) // Состояние для заработка пользователя
	const dispatch = useDispatch()

	// Получение данных из стора Redux
	// const profit = useSelector(state => state.robots.userProfit.profit)
	const isConnected = useSelector(state => {
		const robotData = state.robots.robots.find(r => r.id === robot.id)
		return robotData ? robotData.isConnected : false
	})

	// Проверка подключения пользователя при загрузке компонента
	useEffect(() => {
		dispatch(checkUserConnected({ robotId: robot.id })).then(response => {
			if (
				response.meta.requestStatus === 'fulfilled' &&
				response.payload.isConnected
			) {
				setUserProfit(response.payload.userProfit)
				setEndDate(new Date(response.payload.transaction?.end_date))
			}
		})
	}, [dispatch, robot.id])

	const openModal = () => {
		setIsModalOpen(true)
	}

	// Функция для закрытия модального окна
	const closeModal = () => {
		setIsModalOpen(false)
	}

	const handleChangeInvestment = e => {
		setInvestmentAmount(e.target.value)
	}

	// Логика подключения робота
	const handleConnectRobot = () => {
		console.log('Attempting to connect to robot with amount:', investmentAmount)
		if (investmentAmount >= robot.min_investment) {
			dispatch(
				connectRobot({ robotId: robot.id, amount: investmentAmount, period })
			).then(response => {
				console.log('ConnectRobot Response:', response)
				if (response.meta.requestStatus === 'fulfilled') {
					console.log('Successfully connected to robot')
					closeModal() // Закрываем модальное окно после успешного подключения
				} else {
					console.error('Failed to connect to robot:', response.error)
				}
			})
		} else {
			toast.error(`Minimum investment amount is ${robot.min_investment}`)
		}
	}

	return (
		<div className='standard-card standard-card--type-6-v2'>
			<div className='container'>
				<div className='standard-card__content' data-aos='fade-up'>
					<div className='standard-card__content-head d-flex justify-content-between align-items-center'>
						<div className='d-flex align-items-center'>
							<img
								src='/images/icons/currency-icon.svg'
								alt=''
								className='standard-card__content-currency-icon me-2'
							/>
							<p className='standard-card__content-currency-name'>
								{robot.symbol}
							</p>
						</div>
						<p className='standard-card__content-percentage text-success'>
							≈ {robot.roi}%
						</p>
					</div>
					<div className='d-flex justify-content-between mt-3'>
						<div>
							<p className='mb-0'>Daily %</p>
							<p className='standard-card__content-price-1'>
								≈ {robot.daily_percentage}%
							</p>
						</div>
						<div>
							<p className='mb-0'>Weekly %</p>
							<p className='standard-card__content-price-1'>
								≈ {robot.weekly_percentage}%
							</p>
						</div>
					</div>
					<div className='d-flex justify-content-between mt-3'>
						<div>
							{isConnected ? (
								<>
									<p className='mb-0'>Total earnings: $</p>
									<p className='standard-card__content-price-2'>
										${userProfit || 0}
									</p>
								</>
							) : (
								<>
									<p className='mb-0'>Min Investment</p>
									<p className='standard-card__content-price-2'>
										${robot.min_investment}
									</p>
								</>
							)}
						</div>
					</div>

					{isConnected ? (
						<div>
							<p className='text-success'>You are connected to this robot</p>
							<p>Connection ends on: {endDate?.toLocaleDateString()}</p>
						</div>
					) : (
						<button
							className='w-100 mt-3 btn btn-primary advance-card__button btn-sm btn-pill'
							onClick={openModal}
						>
							Connect Robot
						</button>
					)}
				</div>
			</div>
			<Modal show={isModalOpen} onHide={closeModal} centered>
				<Modal.Header closeButton>
					<Modal.Title>Connect to {robot.symbol}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className='mb-3'>
						<h5>Description</h5>
						<p>{robot.description}</p>
					</div>
					<div className='mb-3'>
						<h5>ROI</h5>
						<p>{robot.roi}%</p>
					</div>
					<div className='mb-3'>
						<h5>Daily Percentage</h5>
						<p>{robot.daily_percentage}%</p>
					</div>
					<div className='mb-3'>
						<h5>Weekly Percentage</h5>
						<p>{robot.weekly_percentage}%</p>
					</div>
					<div className='mb-3'>
						<h5>Minimum Investment</h5>
						<p>${robot.min_investment}</p>
					</div>
					<Form>
						<Form.Group className='mb-3' controlId='investmentAmount'>
							<Form.Label>Investment Amount</Form.Label>
							<Form.Control
								type='number'
								placeholder='Enter investment amount'
								onChange={handleChangeInvestment}
								value={investmentAmount}
							/>
						</Form.Group>
						<Form.Group className='mb-3' controlId='investmentPeriod'>
							<Form.Label>Investment Period</Form.Label>
							<Form.Select
								value={period}
								onChange={e => setPeriod(e.target.value)}
							>
								<option value='daily'>Daily</option>
								<option value='weekly'>Weekly</option>
							</Form.Select>
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={closeModal}>
						Close
					</Button>
					<Button variant='primary' onClick={handleConnectRobot}>
						Connect
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	)
}
