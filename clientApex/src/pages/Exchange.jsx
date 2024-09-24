import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import '../assets/scss/pages/exchange-v2.scss'
import Type2 from '../components/cards/advance/Type2'
import Type4 from '../components/cards/complete/Type4'
import Type8V1 from '../components/cards/standard/Type8v1'
import Type3 from '../components/table/Type3'
import {
	fetchFuturesOrders,
	fetchFuturesPositions,
	fetchSpotOrdersByUser,
	fetchSpotPosition,
} from '../store/slices/tradingSlice'

export default function Exchange() {
	const dispatch = useDispatch()
	const location = useLocation()
	const selectedSymbol = useSelector(state => state.symbol.selectedSymbol)
	const user = useSelector(state => state.auth.data)
	const isSpotTrade = location.pathname.includes('spot')
	useEffect(() => {
		const fetchData = async () => {
			try {
				if (!user.id) {
					console.error('User ID is not available')
					return
				}

				if (isSpotTrade) {
					await dispatch(fetchSpotOrdersByUser())
					await dispatch(fetchSpotPosition())
				} else {
					await dispatch(fetchFuturesOrders())
					await dispatch(fetchFuturesPositions(user.id))
				}
			} catch (error) {
				console.error('Error fetching data:', error)
			}
		}

		fetchData()
	}, [dispatch, location.pathname, user.id, selectedSymbol, isSpotTrade])

	return (
		<div className='exchange exchange--v2'>
			<div className='container container--dashboard-v2'>
				<div className='container container--dashboard'>
					<div className='exchange-group'>
						<div className='exchange-group--right'>
							<Type8V1 />
							<Type4 />
							<Type3 />
						</div>
						<div className='exchange-group--left'>
							<Type2 />
							{/* <Type1 /> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
