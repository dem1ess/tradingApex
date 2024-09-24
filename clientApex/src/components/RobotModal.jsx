/* eslint-disable react/prop-types */
import { Button, Form, Modal } from 'react-bootstrap'

const RobotModal = ({ isOpen, robot, onClose }) => {
	// eslint-disable-next-line no-unused-vars
	const handleChangeInvestment = e => {
		// Можно добавить обработчик изменений для инвестиционной суммы, если требуется
	}

	return (
		<Modal show={isOpen} onHide={onClose} centered>
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
						<Form.Control
							type='number'
							placeholder='Enter investment amount'
							onChange={handleChangeInvestment}
						/>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant='secondary' onClick={onClose}>
					Close
				</Button>
				<Button
					variant='primary'
					onClick={() => console.log('Connect logic here')}
				>
					Connect
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default RobotModal
