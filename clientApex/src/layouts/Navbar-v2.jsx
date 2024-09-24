import 'aos/dist/aos.css'
import { useEffect, useState } from 'react'
import { FaRobot } from 'react-icons/fa'
import { GiTrade } from 'react-icons/gi'
import { RiStockLine } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import {
	fetchGetNotifications,
	fetchMarkAsRead,
} from '../store/slices/notificationSlice'

export default function NavbarV2() {
	const user = useSelector(state => state.auth.data)
	const notifications = useSelector(state => state.notifications.notifications)
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()

	const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true)
	const [isDropdownActive, setIsDropdownActive] = useState(false)
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

	useEffect(() => {
		if (user) {
			dispatch(fetchGetNotifications(user.id)) // Загружаем уведомления при загрузке компонента
		}
	}, [user, dispatch])

	const handleNavbarToggle = () => {
		setIsNavbarCollapsed(prevState => !prevState)
	}

	const handleDropdownToggle = () => {
		setIsDropdownActive(prevState => !prevState)
	}

	const handleNotificationsToggle = () => {
		setIsNotificationsOpen(prevState => !prevState)
		if (!isNotificationsOpen) {
			// Отмечаем все уведомления как прочитанные при открытии
			notifications.forEach(notification => {
				if (!notification.is_read) {
					dispatch(fetchMarkAsRead(notification.id))
				}
			})
		}
	}

	const handleLogout = e => {
		e.preventDefault()
		dispatch(logout())
		navigate('/sign-in')
		setIsNavbarCollapsed(true) // Сворачиваем навбар при выходе
	}

	// Проверка на активную страницу
	const isActive = path => location.pathname === path

	// Общие стили для иконок
	const iconStyle = { width: '24px', height: '24px', marginRight: '10px' }

	// Функция для обработки кликов на ссылки и автоматического сворачивания навбара
	const handleLinkClick = () => {
		setIsNavbarCollapsed(true) // Сворачиваем навбар при переходе на другую страницу
	}

	// Функция для получения заголовка страницы
	const getPageTitle = () => {
		switch (location.pathname) {
			case '/dashboard':
				return 'Dashboard'
			case '/robots':
				return 'Robots'
			case '/wallet':
				return 'Wallet'
			case '/market/spot': // изменено на market/spot
				return 'Market Spot'
			case '/market/futures': // изменено на market/futures
				return 'Market Futures'
			case '/profile':
				return 'Profile'
			default:
				return 'Page'
		}
	}

	return (
		<nav
			className={`navbar navbar-expand-lg header-navbar header-navbar-dashboard--v2 aos-init aos-animate ${
				isNavbarCollapsed ? 'collapsed' : ''
			}`}
			data-aos='fade-down'
		>
			<div className='container container--dashboard-nav'>
				<div className='navbar-left'>
					<Link
						className='navbar-brand'
						to='/dashboard'
						onClick={handleLinkClick}
					>
						<p className='navbar-brand__text'>{getPageTitle()}</p>
						<img
							src='/images/icons/logo-.png'
							alt='Brand Logo'
							className='navbar-brand__icon'
						/>
					</Link>
				</div>
				<div className='navbar-right'>
					{/* Уведомления */}
					<div className='navbar-notifications'>
						<img
							src='/images/icons/notifications.svg'
							alt='notifications-icon'
							className='navbar-notifications__image'
							onClick={handleNotificationsToggle}
						/>
						{isNotificationsOpen && (
							<div className='navbar-notifications__dropdown active'>
								<p className='fb-regular fb-regular--bold notifications__title'>
									Notifications
								</p>
								<div className='notifications__box'>
									{notifications.length > 0 ? (
										notifications.map(notification => (
											<div
												key={notification.id}
												className={`notifications__item ${
													notification.is_read ? 'read' : 'unread'
												}`}
											>
												<div className='notifications__item-message'>
													<p className='notifications__item-text'>
														{notification.message}
													</p>
												</div>
											</div>
										))
									) : (
										<p>No notifications</p>
									)}
								</div>
							</div>
						)}
					</div>
					{/* Профиль */}
					<div className='navbar-profile-menu'>
						<p className='navbar-profile-menu__text'>
							{user?.first_name + ' ' + user?.last_name}
						</p>
						<img
							src={
								user?.avatar_url
									? `http://localhost:3001${user?.avatar_url}`
									: '/images/profile-photo.png' // Аватар по умолчанию, если у пользователя нет аватара
							}
							alt='Profile'
							className='navbar-profile-menu__image'
						/>
						<img
							src='/images/icons/arrow-down.svg'
							alt='arrow-down-icon'
							className={`navbar-profile-menu__arrow ${
								isDropdownActive ? 'active' : ''
							}`}
							onClick={handleDropdownToggle}
						/>
						<div
							className={`navbar-profile-menu__dropdown ${
								isDropdownActive ? 'active' : ''
							}`}
						>
							<div className='navbar-profile-menu__dropdown-item'>
								<Link
									className='fb-regular dropdown-item__link'
									to='/profile'
									onClick={handleLinkClick}
								>
									Account
								</Link>
							</div>
							<div className='navbar-profile-menu__dropdown-item'>
								<Link
									className='fb-regular dropdown-item__link'
									to='/sign-in'
									onClick={handleLogout}
								>
									Log Out
								</Link>
							</div>
						</div>
					</div>
					<button
						className='navbar-toggler'
						type='button'
						onClick={handleNavbarToggle}
					>
						<img src='/images/icons/menu.svg' alt='MENU' />
					</button>
				</div>

				<div
					className={`navbar-collapse collapse ${
						!isNavbarCollapsed ? 'show' : ''
					}`}
					id='navbarSupportedContent'
				>
					<div className='navbar-collapse__content'>
						<ul className='navbar-nav me-auto mb-2 mb-lg-0'>
							<li className='nav-item'>
								<Link
									className={`nav-link ${
										isActive('/dashboard') ? 'active' : ''
									}`}
									to='/dashboard'
									onClick={handleLinkClick}
								>
									<img
										src='/images/icons/dashboard-menu-icon.svg'
										alt='Dashboard'
										style={iconStyle}
									/>
									Dashboard
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									className={`nav-link ${isActive('/robots') ? 'active' : ''}`}
									to='/robots'
									onClick={handleLinkClick}
								>
									<FaRobot style={iconStyle} />
									Robots
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}
									to='/wallet'
									onClick={handleLinkClick}
								>
									<img
										src='/images/icons/wallet-menu-icon.svg'
										alt='Wallet'
										style={iconStyle}
									/>
									Wallet
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									className={`nav-link ${
										isActive('/market/spot') ? 'active' : ''
									}`}
									to='/market/spot'
									onClick={handleLinkClick}
								>
									<GiTrade style={iconStyle} />
									Spot Market
								</Link>
							</li>
							<li className='nav-item'>
								<Link
									className={`nav-link ${
										isActive('/market/futures') ? 'active' : ''
									}`}
									to='/market/futures'
									onClick={handleLinkClick}
								>
									<RiStockLine style={iconStyle} />
									Futures Market
								</Link>
							</li>
						</ul>
						{/* Профильная информация */}
						<div className='navbar-profile-menu'>
							<p className='navbar-profile-menu__text'>
								{user?.first_name + ' ' + user?.last_name}
							</p>
							<img
								src={
									user?.avatar_url
										? `http://localhost:3001${user?.avatar_url}`
										: '/images/profile-photo.png'
								}
								alt='Profile'
								className='navbar-profile-menu__image'
							/>
							<img
								src='/images/icons/arrow-down.svg'
								alt='arrow-down-icon'
								className={`navbar-profile-menu__arrow ${
									isDropdownActive ? 'active' : ''
								}`}
								onClick={handleDropdownToggle}
							/>
							<div
								className={`navbar-profile-menu__dropdown ${
									isDropdownActive ? 'active' : ''
								}`}
							>
								<div className='navbar-profile-menu__dropdown-item'>
									<Link
										className='fb-regular dropdown-item__link'
										to='/profile'
										onClick={handleLinkClick}
									>
										Account
									</Link>
								</div>
								<div className='navbar-profile-menu__dropdown-item'>
									<Link
										className='fb-regular dropdown-item__link'
										to='/sign-in'
										onClick={handleLogout}
									>
										Log Out
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
