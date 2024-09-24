/* eslint-disable react/prop-types */
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import {
	fetchFuturesOrders,
	fetchFuturesPositions,
	fetchSpotOrdersByUser,
	fetchSpotPosition,
	updateFuturesOrderStatus,
	updateSpotOrderStatus,
} from '../../store/slices/tradingSlice' // Импортируем экшены для спотовой и фьючерсной торговли

const ActiveOrdersRow = ({ order, tradeType }) => {
	const price = parseFloat(order?.price) || 0
	const quantity = parseFloat(order?.quantity) || 0
	const total = (price * quantity).toFixed(2)

	const dispatch = useDispatch() // Получаем функцию dispatch

	const handleCancelOrder = async () => {
		const orderId = order.id || order.order_id // Получаем ID ордера
		if (orderId) {
			try {
				// В зависимости от типа торговли, обновляем статус ордера
				if (tradeType === 'spot') {
					// Для спотовой торговли, обновляем статус ордера на canceled
					await dispatch(
						updateSpotOrderStatus({ orderId, status: 'canceled' })
					).unwrap()
					await dispatch(fetchSpotOrdersByUser())
					await dispatch(fetchSpotPosition())
				} else if (tradeType === 'futures') {
					// Для фьючерсной торговли, обновляем статус ордера на canceled
					await dispatch(
						updateFuturesOrderStatus({ orderId, status: 'canceled' })
					).unwrap()
					dispatch(fetchFuturesOrders())
					dispatch(fetchFuturesPositions())
				}
				toast.success('Order status updated to canceled successfully')
			} catch (error) {
				toast.error(`Error updating order status: ${error.message}`)
			}
		}
	}

	return (
		<tr className='table-row'>
			<td>
				<p className='fb-regular'>{order.symbol}</p>
			</td>
			<td>
				<p className='fb-regular'>{price.toFixed(2)}</p>
			</td>
			<td>
				<p className='fb-regular'>{quantity.toFixed(2)}</p>
			</td>
			{tradeType === 'futures' && (
				<td>
					<p className='fb-regular'>{order.leverage || 'N/A'}</p>
				</td>
			)}
			<td>
				<p className='fb-regular'>{total}</p>
			</td>
			<td>
				<p className='fb-regular'>{order.order_type || order.type}</p>
			</td>
			<td>
				<p className='fb-regular'>{order.status || 'N/A'}</p>
			</td>
			<td>
				<button onClick={handleCancelOrder} className='btn btn-danger'>
					Cancel
				</button>
			</td>
		</tr>
	)
}

export default ActiveOrdersRow
