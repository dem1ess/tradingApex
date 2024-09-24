import { useState } from 'react'
import { FaRobot } from 'react-icons/fa'
import { GiTrade } from 'react-icons/gi'
import { RiStockLine } from 'react-icons/ri'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
	const [isExpanded, setIsExpanded] = useState(false)
	const location = useLocation()

	const toggleSidebar = () => {
		setIsExpanded(prevState => !prevState)
	}

	return (
		<nav className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
			<div className='container'>
				<div className='sidebar-logo' onClick={toggleSidebar}>
					<img
						src='/images/icons/logo-.png'
						alt='Logo'
						className='sidebar-logo__image'
					/>
				</div>
				<div className='sidebar-menu'>
					<img
						src='/images/icons/menu.svg'
						alt='Menu'
						className='sidebar-menu__hamburger-menu'
						onClick={toggleSidebar}
					/>
					<Link
						to='/dashboard'
						className={`sidebar-menu__list ${
							location.pathname === '/dashboard' ? 'active' : ''
						}`}
					>
						<img
							src='/images/icons/dashboard-menu-icon.svg'
							alt='Dashboard'
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Dashboard</p>
					</Link>
					<Link
						to='/robots'
						className={`sidebar-menu__list ${
							location.pathname === '/robots' ? 'active' : ''
						}`}
					>
						<FaRobot
							style={{ height: '24px', width: '24px', color: '#5d6588' }}
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Robots</p>
					</Link>
					<Link
						to='/wallet'
						className={`sidebar-menu__list ${
							location.pathname === '/wallet' ? 'active' : ''
						}`}
					>
						<img
							src='/images/icons/wallet-menu-icon.svg'
							alt='Wallet'
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Wallet</p>
					</Link>
					<Link
						to='/market/spot'
						className={`sidebar-menu__list ${
							location.pathname === '/market/spot' ? 'active' : ''
						}`}
					>
						<GiTrade
							style={{ height: '24px', width: '24px', color: '#5d6588' }}
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Spot Market</p>
					</Link>
					<Link
						to='/market/futures'
						className={`sidebar-menu__list ${
							location.pathname === '/market/futures' ? 'active' : ''
						}`}
					>
						<RiStockLine
							style={{ height: '24px', width: '24px', color: '#5d6588' }}
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Futures Market</p>
					</Link>
					<Link
						to='/profile'
						className={`sidebar-menu__list ${
							location.pathname === '/profile' ? 'active' : ''
						}`}
					>
						<img
							src='/images/icons/settings-menu-icon.svg'
							alt='Settings'
							className='sidebar-menu__list-icon'
						/>
						<p className='sidebar-menu__list-name'>Settings</p>
					</Link>
				</div>
			</div>
			<div className='sidebar-menu--mobile'>
				<Link
					to='/dashboard'
					className={`sidebar-menu__list ${
						location.pathname === '/dashboard' ? 'active' : ''
					}`}
				>
					<img
						src='/images/icons/dashboard-menu-icon.svg'
						alt='Dashboard'
						className='sidebar-menu__list-icon'
					/>
					<p className='sidebar-menu__list-name'>Dashboard</p>
				</Link>

				<Link
					to='/wallet'
					className={`sidebar-menu__list ${
						location.pathname === '/wallet' ? 'active' : ''
					}`}
				>
					<img
						src='/images/icons/wallet-menu-icon.svg'
						alt='Wallet'
						className='sidebar-menu__list-icon'
					/>
					<p className='sidebar-menu__list-name'>Wallet</p>
				</Link>
				<Link
					to='/market/spot'
					className={`sidebar-menu__list ${
						location.pathname === '/market/spot' ? 'active' : ''
					}`}
				>
					<GiTrade
						style={{ height: '24px', width: '24px', color: '#5d6588' }}
						className='sidebar-menu__list-icon'
					/>
					<p className='sidebar-menu__list-name'>Spot Market</p>
				</Link>
				<Link
					to='/market/futures'
					className={`sidebar-menu__list ${
						location.pathname === '/market/futures' ? 'active' : ''
					}`}
				>
					<RiStockLine
						style={{ height: '24px', width: '24px', color: '#5d6588' }}
						className='sidebar-menu__list-icon'
					/>
					<p className='sidebar-menu__list-name'>Futures Market</p>
				</Link>
				<Link
					to='/profile'
					className={`sidebar-menu__list ${
						location.pathname === '/profile' ? 'active' : ''
					}`}
				>
					<img
						src='/images/icons/settings-menu-icon.svg'
						alt='Settings'
						className='sidebar-menu__list-icon'
					/>
					<p className='sidebar-menu__list-name'>Settings</p>
				</Link>
			</div>
		</nav>
	)
}
