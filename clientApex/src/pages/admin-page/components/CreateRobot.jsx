import { useState } from 'react'
import { Button, Container, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createRobot } from '../../../store/slices/robotSlice'

// Списки доступных символов
const usdPairs = [
	'BTC-USD',
	'ETH-USD',
	'USDT-USD',
	'XRP-USD',
	'ADA-USD',
	'SOL-USD',
	'DOGE-USD',
	'LTC-USD',
	'SHIB-USD',
	'TRX-USD',
	'XLM-USD',
	'ETC-USD',
	'BCH-USD',
	'XMR-USD',
	'EOS-USD',
	'ZEC-USD',
	'DASH-USD',
]

const stocks = [
	'AAPL',
	'MSFT',
	'GOOGL',
	'AMZN',
	'FB',
	'TSLA',
	// другие акции...
]

const CreateRobot = () => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		dailyPercentage: '',
		weeklyPercentage: '',
		symbol: '',
		robotType: '',
		roi: '',
		minInvestment: '',
	})

	const dispatch = useDispatch()
	const status = useSelector(state => state.robots.status)
	const error = useSelector(state => state.robots.error)

	// Функция для обработки изменений в форме
	const handleChange = e => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
	}

	// Функция для обработки отправки формы
	const handleSubmit = e => {
		e.preventDefault()
		dispatch(createRobot(formData)).then(result => {
			if (result.type.endsWith('fulfilled')) {
				setFormData({
					name: '',
					description: '',
					dailyPercentage: '',
					weeklyPercentage: '',
					symbol: '',
					robotType: '',
					roi: '',
					minInvestment: '',
				})
			}
		})
	}

	// Комбинированный список для выбора символа
	const combinedSymbols = [...usdPairs, ...stocks]

	return (
		<Container
			style={{
				backgroundColor: '#1a1a1a',
				color: '#ffffff',
				padding: '2rem',
				borderRadius: '8px',
			}}
		>
			<h1>Create Robot</h1>
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId='name'>
					<Form.Label>Robot Name</Form.Label>
					<Form.Control
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='symbol'>
					<Form.Label>Symbol (Выберите из списка)</Form.Label>
					<Form.Control
						as='select'
						name='symbol'
						value={formData.symbol}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					>
						<option value=''>Выберите...</option>
						{combinedSymbols.map((symbol, index) => (
							<option key={index} value={symbol}>
								{symbol}
							</option>
						))}
					</Form.Control>
				</Form.Group>

				<Form.Group controlId='description'>
					<Form.Label>Description</Form.Label>
					<Form.Control
						as='textarea'
						rows={3}
						name='description'
						value={formData.description}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='dailyPercentage'>
					<Form.Label>Daily Percentage</Form.Label>
					<Form.Control
						type='number'
						name='dailyPercentage'
						value={formData.dailyPercentage}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='weeklyPercentage'>
					<Form.Label>Weekly Percentage</Form.Label>
					<Form.Control
						type='number'
						name='weeklyPercentage'
						value={formData.weeklyPercentage}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='robotType'>
					<Form.Label>Robot Type</Form.Label>
					<Form.Control
						type='text'
						name='robotType'
						value={formData.robotType}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='roi'>
					<Form.Label>ROI</Form.Label>
					<Form.Control
						type='number'
						name='roi'
						value={formData.roi}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Form.Group controlId='minInvestment'>
					<Form.Label>Minimum Investment</Form.Label>
					<Form.Control
						type='number'
						name='minInvestment'
						value={formData.minInvestment}
						onChange={handleChange}
						required
						style={{ backgroundColor: '#333', color: '#fff' }}
					/>
				</Form.Group>

				<Button variant='primary' type='submit'>
					Create Robot
				</Button>
			</Form>

			{status === 'loading' && <p>Loading...</p>}
			{status === 'failed' && <p className='text-danger'>Error: {error}</p>}
			{status === 'succeeded' && (
				<p className='text-success'>Robot created successfully!</p>
			)}
		</Container>
	)
}

export default CreateRobot
