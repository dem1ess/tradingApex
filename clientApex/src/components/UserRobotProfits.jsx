import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUserProfits, fetchRobots } from '../store/slices/robotSlice' // Импортируем экшен для получения прибыли

export default function UserRobotProfits() {
	const dispatch = useDispatch()
	const userProfits = useSelector(state => state.robots.userProfits || {})
	const robots = useSelector(state => state.robots.robots || [])
	const [profitData, setProfitData] = useState([])

	// Преобразование данных и фильтрация
	useEffect(() => {
		dispatch(fetchAllUserProfits())
		dispatch(fetchRobots())
	}, [dispatch])

	useEffect(() => {
		if (robots.length && Object.keys(userProfits).length) {
			// Преобразуем данные по роботам в нужный формат
			const profitList = robots.map(robot => {
				const profit = userProfits[robot.id] || 0
				return {
					robotName: robot.name,
					robotType: robot.robot_type,
					profit: parseFloat(profit.toFixed(2)), // Округляем до двух знаков после запятой
				}
			})

			// Сортируем по убыванию прибыли
			const sortedProfitList = profitList.sort((a, b) => b.profit - a.profit)

			setProfitData(sortedProfitList)
		}
	}, [robots, userProfits])

	return (
		<div className='standard-card standard-card--type-7' data-aos='fade-up'>
			<div className='container'>
				<div className='standard-card__head'>
					<h6 className='standard-card__title'>Your Robot Profits</h6>
				</div>
				<div className='standard-card__content'>
					{profitData.map((robot, index) => (
						<div className='standard-card__content__list' key={index}>
							<div className='standard-card__content__list-info-left'>
								<p className='fb-regular fb-regular--bold standard-card__content__list-info-value'>
									{robot.profit} USD {/* Выводим прибыль */}
								</p>
								<p className='fb-regular standard-card__content__list-info-crypto'>
									{robot.robotName} ({robot.robotType})
								</p>
							</div>
						</div>
					))}
				</div>
				<div className='standard-card__vignette'></div>
			</div>
		</div>
	)
}
