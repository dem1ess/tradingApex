/* eslint-disable react/prop-types */

const OrderHistoryRow = ({ order, tradeType }) => {
	const price = parseFloat(order?.price) || 0
	const quantity = parseFloat(order?.quantity) || 0
	const total = (price * quantity).toFixed(2)

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
		</tr>
	)
}

export default OrderHistoryRow
