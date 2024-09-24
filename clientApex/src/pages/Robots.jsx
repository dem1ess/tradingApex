import { useEffect, useState } from 'react'
import {
	Button,
	FormControl,
	InputGroup,
	ToggleButton,
	ToggleButtonGroup,
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import RobotItem from '../components/RobotItem'
import { fetchRobots } from '../store/slices/robotSlice'

export default function Robots() {
	const dispatch = useDispatch()
	const { robots, isLoading } = useSelector(state => state.robots)
	const [symbolFilter, setSymbolFilter] = useState('')
	// eslint-disable-next-line no-unused-vars
	const [roiFilter, setRoiFilter] = useState('')
	const [filteredRobots, setFilteredRobots] = useState([])
	const [robotType, setRobotType] = useState('spot')

	useEffect(() => {
		dispatch(fetchRobots())
	}, [dispatch])

	useEffect(() => {
		// Фильтрация роботов по символу и типу
		const filterData = robots.filter(robot => {
			return (
				robot.symbol.toLowerCase().includes(symbolFilter.toLowerCase()) &&
				(roiFilter ? robot.roi >= Number(roiFilter) : true) &&
				robot.robot_type === robotType
			)
		})
		setFilteredRobots(filterData)
	}, [robots, symbolFilter, roiFilter, robotType])

	return (
		<div className='container container--dashboard-v2 bg-dark text-white'>
			<div className='container container--dashboard py-4'>
				<div className='mb-4'>
					<ToggleButtonGroup
						type='radio'
						name='robotType'
						defaultValue={robotType}
						onChange={setRobotType}
					>
						<ToggleButton id='tbg-btn-1' value={'spot'} variant='outline-light'>
							Spot
						</ToggleButton>
						<ToggleButton
							id='tbg-btn-2'
							value={'futures'}
							variant='outline-light'
						>
							Futures
						</ToggleButton>
					</ToggleButtonGroup>
				</div>
				<div className='mb-4'>
					<InputGroup className='mb-3'>
						<FormControl
							placeholder='Search by symbol'
							aria-label='Search by symbol'
							value={symbolFilter}
							onChange={e => setSymbolFilter(e.target.value)}
						/>
						<Button
							variant='outline-secondary'
							onClick={() => setFilteredRobots(robots)}
						>
							Search
						</Button>
					</InputGroup>
				</div>

				{isLoading ? (
					<div>Loading...</div>
				) : (
					<div className='row row-cols-1 row-cols-md-3 gap-2 g-4'>
						{filteredRobots.map(robot => (
							<RobotItem key={robot.id} robot={robot} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}
