// NavbarAdmin.js
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../../../store/slices/authSlice'

const NavbarAdmin = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const user = useSelector(state => state.auth.data)

	const handleLogout = () => {
		dispatch(logout())
		navigate('/sign-in')
	}

	return (
		<Navbar bg='dark' variant='dark' expand='lg' className='mb-4'>
			<Container>
				<Navbar.Brand as={Link} to='/dashboard'>
					ApexFinance
				</Navbar.Brand>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='me-auto'>
						<Nav.Link as={Link} to='/admin-page/users'>
							Users
						</Nav.Link>
						<Nav.Link as={Link} to='/admin-page/transactions'>
							Transactions
						</Nav.Link>
						<Nav.Link as={Link} to='/admin-page/robots'>
							Robots
						</Nav.Link>
						<Nav.Link as={Link} to='/admin-page/create-robot'>
							Create Robots
						</Nav.Link>
						<Nav.Link as={Link} to='/admin-page/price-adjustment'>
							Price Adjustment
						</Nav.Link>
					</Nav>
					<Dropdown align='end'>
						<Dropdown.Toggle variant='secondary'>
							{user ? `${user.first_name} ${user.last_name}` : 'Account'}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item as={Link} to='/profile'>
								Profile
							</Dropdown.Item>
							<Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}

export default NavbarAdmin
