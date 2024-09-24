import { useEffect, useState } from 'react'
import {
	Button,
	Col,
	Container,
	Form,
	Row,
	Spinner,
	Table,
} from 'react-bootstrap' // Импортируем Row и Col
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchPriceAdjustments,
	setPriceAdjustment,
} from '../../../store/slices/priceAbjustment'

// Предопределенные символы для криптовалют и акций
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
	// more stocks...
]

const PriceAdjustmentPage = () => {
	const dispatch = useDispatch()
	const { adjustments, status, error } = useSelector(
		state => state.priceAdjustments
	)
	const [symbol, setSymbol] = useState('')
	const [adjustment, setAdjustment] = useState('')

	useEffect(() => {
		dispatch(fetchPriceAdjustments())
	}, [dispatch])

	const handleSetAdjustment = () => {
		if (symbol && adjustment) {
			dispatch(
				setPriceAdjustment({ symbol, adjustment: parseFloat(adjustment) })
			)
			setSymbol('')
			setAdjustment('')
		}
	}

	return (
		<Container
			style={{
				backgroundColor: '#1a1a1a',
				color: '#ffffff',
				padding: '2rem',
				borderRadius: '8px',
			}}
		>
			<h1>Price Adjustment Management</h1>
			<Form className='my-4'>
				<Row>
					<Col>
						<Form.Group controlId='symbol'>
							<Form.Label>Symbol</Form.Label>
							<Form.Control
								as='select'
								value={symbol}
								onChange={e => setSymbol(e.target.value)}
								required
								style={{ backgroundColor: '#333', color: '#fff' }}
							>
								<option value=''>Select a symbol</option>
								<optgroup label='Crypto'>
									{usdPairs.map(crypto => (
										<option key={crypto} value={crypto}>
											{crypto}
										</option>
									))}
								</optgroup>
								<optgroup label='Stocks'>
									{stocks.map(stock => (
										<option key={stock} value={stock}>
											{stock}
										</option>
									))}
								</optgroup>
							</Form.Control>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='adjustment'>
							<Form.Label>Adjustment (%)</Form.Label>
							<Form.Control
								type='number'
								placeholder='Enter adjustment'
								value={adjustment}
								onChange={e => setAdjustment(e.target.value)}
								required
								style={{ backgroundColor: '#333', color: '#fff' }}
							/>
						</Form.Group>
					</Col>
					<Col className='align-self-end'>
						<Button className='ml-3' onClick={handleSetAdjustment}>
							Set Adjustment
						</Button>
					</Col>
				</Row>
			</Form>
			{status === 'loading' && <Spinner animation='border' variant='light' />}
			{status === 'failed' && <p className='text-danger'>Error: {error}</p>}
			{adjustments.length > 0 && (
				<Table striped bordered hover variant='dark'>
					<thead>
						<tr>
							<th>Symbol</th>
							<th>Adjustment (%)</th>
						</tr>
					</thead>
					<tbody>
						{adjustments.map(adjustment => (
							<tr key={adjustment.symbol}>
								<td>{adjustment.symbol}</td>
								<td>{adjustment.adjustment}</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
		</Container>
	)
}

export default PriceAdjustmentPage
