/* eslint-disable react/prop-types */
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { io } from 'socket.io-client' // Import Socket.IO client
import './App.scss'
import Loader from './components/loader/Loader'
import PrivateRoute from './components/PrivateRoute'
import './index.scss'
import NavbarV2 from './layouts/Navbar-v2'
import Sidebar from './layouts/Sidebar'
import AdminPanel from './pages/admin-page/adminPage'
import ConfirmEmailScreen from './pages/ConfirmEmail'
import Dashboard from './pages/Dashboard'
import Exchange from './pages/Exchange'
import ForgotPasswordScreen from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Profile from './pages/Profile'
import ResetPasswordScreen from './pages/ResetPassword'
import Robots from './pages/Robots'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Wallet from './pages/Wallet'
import { fetchVerifyToken2, logout } from './store/slices/authSlice'
import {
	clearPrices,
	setAllPrices,
	setError,
	setStatus,
} from './store/slices/pricesSlice' // Import actions from priceSlice
import { fetchSpotPosition } from './store/slices/tradingSlice'

const excludedPaths = ['/sign-in', '/sign-up', '/'] // Пути, для которых не требуется авторизация

const useAuthRedirect = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const token = localStorage.getItem('token')

	useEffect(() => {
		const shouldExclude = excludedPaths.some(
			path => location.pathname === path || location.pathname.startsWith(path)
		)

		if (!shouldExclude && !token) {
			navigate('/sign-in')
		}
	}, [token, navigate, location.pathname])
}

function App() {
	const dispatch = useDispatch()
	const { isCheckingAuth } = useSelector(state => state.auth)
	const token = localStorage.getItem('token')

	useEffect(() => {
		AOS.init({ once: true })
	}, [])

	useEffect(() => {
		const checkAuth = async () => {
			if (token) {
				try {
					const response = await dispatch(fetchVerifyToken2(token))
					dispatch(fetchSpotPosition())

					if (response.error) {
						dispatch(logout())
					}
				} catch (error) {
					console.error('Error verifying authentication:', error)
					dispatch(logout())
				}
			} else {
				dispatch(logout())
			}
		}
		checkAuth()
	}, [dispatch, token])

	// Set up Socket.IO connection to receive price updates
	useEffect(() => {
		const socket = io('http://localhost:8000/allPrices')

		socket.on('connect', () => {
			dispatch(setStatus('connected'))
			console.log('Connected to the Socket.IO server')
		})

		socket.on('disconnect', () => {
			dispatch(setStatus('disconnected'))
			console.log('Disconnected from the Socket.IO server')
		})

		socket.on('allPrices', data => {
			dispatch(setAllPrices(data))
		})

		socket.on('connect_error', err => {
			dispatch(setError(err.message))
			console.error('Connection error:', err.message)
		})

		return () => {
			socket.disconnect()
			dispatch(setStatus('disconnected'))
			dispatch(clearPrices())
		}
	}, [dispatch])

	if (isCheckingAuth) {
		return <Loader />
	}

	const HideNavbarFooterRoutes = ({ children }) => {
		const location = useLocation()
		const hideNavbarFooterRoutes = [
			'/reset-password/*',
			'/sign-up',
			'/sign-in',
			'/',
			'/forgot-password',
			'/confirm-email/*',
			'/admin-page/*',
			'/privacy-policy',
			'/reset-password',
		]

		const hideNavbarFooter = hideNavbarFooterRoutes.some(path => {
			if (path.endsWith('*')) {
				return location.pathname.startsWith(path.slice(0, -1))
			}
			return location.pathname === path
		})

		return hideNavbarFooter ? (
			children
		) : (
			<>
				<Sidebar />
				<div className='content'>
					<NavbarV2 />
				</div>
				<Suspense fallback={<Loader />}>{children}</Suspense>
			</>
		)
	}

	return (
		<BrowserRouter>
			<AuthProvider>
				<HideNavbarFooterRoutes>
					<Routes>
						<Route path='/' element={<LandingPage />} />
						<Route path='/robots' element={<Robots />} />
						<Route
							path='/dashboard'
							element={
								<PrivateRoute>
									<Dashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path='/wallet'
							element={
								<PrivateRoute>
									<Wallet />
								</PrivateRoute>
							}
						/>
						<Route
							path='/profile'
							element={
								<PrivateRoute>
									<Profile />
								</PrivateRoute>
							}
						/>
						<Route path='/sign-up' element={<SignUp />} />
						<Route
							path='/confirm-email/:token'
							element={<ConfirmEmailScreen />}
						/>
						<Route path='/reset-password/*' element={<ResetPasswordScreen />} />
						<Route path='/forgot-password' element={<ForgotPasswordScreen />} />
						<Route path='/sign-in' element={<SignIn />} />
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route
							path='/market/futures'
							element={
								<PrivateRoute>
									<Exchange />
								</PrivateRoute>
							}
						/>
						<Route
							path='/market/spot'
							element={
								<PrivateRoute>
									<Exchange />
								</PrivateRoute>
							}
						/>
						<Route
							path='/admin-page/*'
							element={
								<PrivateRoute>
									<AdminPanel />
								</PrivateRoute>
							}
						/>

						{/* Добавляем обработку несуществующих маршрутов */}
						<Route path='*' element={<Navigate to='/profile' replace />} />
					</Routes>
					<ToastContainer />
				</HideNavbarFooterRoutes>
			</AuthProvider>
		</BrowserRouter>
	)
}

const AuthProvider = ({ children }) => {
	useAuthRedirect() // Обработка авторизации

	return children
}

export default App
