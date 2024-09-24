import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/scss/components/_headers.scss'

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	// Функция для переключения состояния меню
	const toggleMenu = () => {
		setIsMenuOpen(prevState => !prevState)
	}

	return (
		<nav
			className='navbar navbar-expand-lg header-navbar header-navbar--v2'
			data-aos='fade-down'
		>
			<div className='container'>
				<Link className='navbar-brand' to='/'>
					<img
						style={{ width: '130px' }}
						src='/images/logo-full.png'
						alt='Cryptolly'
					/>
				</Link>
				<button
					className='navbar-toggler ml-auto'
					type='button'
					onClick={toggleMenu} // Обработчик клика для переключения меню
					aria-controls='navbarSupportedContent'
					aria-expanded={isMenuOpen} // Управляемое состояние для кнопки
					aria-label='Toggle navigation'
				>
					<img src='/images/icons/menu.svg' alt='MENU' />
				</button>
				<div
					className={`navbar-collapse collapse ${isMenuOpen ? 'show' : ''}`} // Показываем или скрываем блок
					id='navbarSupportedContent'
				>
					<div className='navbar-collapse__content'>
						<ul className='navbar-nav me-auto mb-2 mb-lg-0'></ul>
						<div className='navbar-buttons'>
							<Link to='/sign-in' className='btn btn-secondary btn-sm'>
								Sign in
							</Link>
							<Link to='/sign-up' className='btn btn-primary btn-sm'>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}
