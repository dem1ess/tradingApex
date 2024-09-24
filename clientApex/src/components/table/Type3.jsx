import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import ActiveOrdersRow from './ActiveOrdersRow'
import FuturesPositionRow from './FuturesPositionRow'
import OrderHistoryRow from './OrderHistoryRow'
import SpotPositionRow from './SpotPositionRow'

export default function OrdersAndPositions() {
	const [activeTab, setActiveTab] = useState('open-order')
	const [sortConfig, setSortConfig] = useState({ key: '', direction: '' })

	const location = useLocation()
	const spotOrders = useSelector(state => state.trading.spotOrders)
	const futuresOrders = useSelector(state => state.trading.futuresOrders)
	const { futuresPositions, spotPositions } = useSelector(
		state => state.trading
	)
	const prices = useSelector(state => state.prices.prices)

	const tradeType = location.pathname.includes('spot') ? 'spot' : 'futures'
	const positions = tradeType === 'spot' ? spotPositions : futuresPositions
	const orders = tradeType === 'spot' ? spotOrders : futuresOrders

	const handleSort = key => {
		let direction = 'ascending'
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending'
		}
		setSortConfig({ key, direction })
	}

	const sortedOrders = [...orders].sort((a, b) => {
		if (sortConfig.key) {
			const aValue = a[sortConfig.key]
			const bValue = b[sortConfig.key]

			if (aValue < bValue) {
				return sortConfig.direction === 'ascending' ? -1 : 1
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'ascending' ? 1 : -1
			}
		}
		return 0
	})

	const filteredOrders = sortedOrders.filter(order => {
		if (activeTab === 'open-order') {
			return tradeType === 'spot'
				? order.status === 'open'
				: order.status === 'pending'
		} else if (activeTab === 'order-history') {
			return tradeType === 'spot'
				? order.status === 'closed'
				: order.status === 'fulfilled'
		}
		return true
	})

	const tabs = [
		{ id: 'open-order', label: 'Open Orders' },
		{ id: 'order-history', label: 'Order History' },
		{ id: 'positions', label: 'Positions' },
	]

	return (
		<div className='table-wrapper table--type-3' data-aos='fade-up'>
			<div className='table__title'>
				<h6 className='table__title-text'>Orders & Positions</h6>
				<nav className='navbar'>
					<div className='table__title-tabs'>
						{tabs.map(tab => (
							<li className='nav-item' key={tab.id}>
								<p
									className={`fb-regular fb-regular--bold table__title-tab ${
										activeTab === tab.id ? 'active' : ''
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									{tab.label}
								</p>
							</li>
						))}
					</div>
				</nav>
			</div>

			<div className='tab-content'>
				{activeTab !== 'positions' ? (
					<div className='table-container'>
						{filteredOrders.length > 0 ? (
							<table className='table table-content'>
								<thead>
									<tr>
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('price')}
										>
											Symbol
										</th>
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('price')}
										>
											Price
										</th>
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('quantity')}
										>
											Quantity
										</th>
										{tradeType === 'futures' && (
											<th
												className='fb-regular table__head'
												onClick={() => handleSort('leverage')}
											>
												Leverage
											</th>
										)}
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('total')}
										>
											Total
										</th>
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('type')}
										>
											Type
										</th>
										<th
											className='fb-regular table__head'
											onClick={() => handleSort('status')}
										>
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredOrders.map(order =>
										activeTab === 'open-order' ? (
											<ActiveOrdersRow
												key={order.id}
												order={order}
												tradeType={tradeType}
											/>
										) : (
											<OrderHistoryRow
												key={order.id}
												order={order}
												tradeType={tradeType}
											/>
										)
									)}
								</tbody>
							</table>
						) : (
							<p>No orders available</p>
						)}
					</div>
				) : (
					<div className='table-container'>
						<table className='table table-content'>
							<thead>
								<tr>
									<th className='fb-regular table__head'>Symbol</th>
									<th className='fb-regular table__head'>Quantity</th>
									{tradeType === 'futures' && (
										<>
											<th className='fb-regular table__head'>Entry Price</th>
											<th className='fb-regular table__head'>Leverage</th>
											<th className='fb-regular table__head'>Position Type</th>
											<th className='fb-regular table__head'>Status</th>
										</>
									)}
									{tradeType === 'spot' && (
										<th className='fb-regular table__head'>Current Price</th>
									)}
									<th className='fb-regular table__head'>Total</th>
								</tr>
							</thead>
							<tbody>
								{positions.map(position =>
									tradeType === 'futures' ? (
										<FuturesPositionRow key={position.id} position={position} />
									) : (
										<SpotPositionRow
											key={position.id}
											position={position}
											currentPrice={prices[position.symbol]}
										/>
									)
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
