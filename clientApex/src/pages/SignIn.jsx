import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../assets/scss/pages/sign-in.scss'
import { setTokenToLocalStorage } from '../helpers/localstorage.helper'
import { fetchAuth, fetchVerifyToken2 } from '../store/slices/authSlice'

export default function SignIn() {
	const isAuth = useSelector(state => state.auth.isAuth)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const [formValues, setFormValues] = useState({
		email: '',
		password: '',
		rememberPassword: false, // Добавлено состояние для чекбокса
	})

	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setFormValues({
			...formValues,
			[name]: type === 'checkbox' ? checked : value, // Для чекбокса используем checked
		})
	}

	useEffect(() => {
		if (isAuth) {
			navigate('/market')
		}
	}, [isAuth, navigate])

	const handleSubmit = async e => {
		e.preventDefault()

		const userData = {
			email: formValues.email,
			password: formValues.password,
		}

		try {
			const authData = await dispatch(fetchAuth(userData)).unwrap()
			if ('token' in authData) {
				setTokenToLocalStorage(authData.token)

				// Fetch and verify token
				const profileData = await dispatch(
					fetchVerifyToken2(authData.token)
				).unwrap()
				console.log('Profile data:', profileData)
			}
		} catch (err) {
			// Показываем сообщение об ошибке через toast
			console.log('Error:', err)
			toast.error(err.error || 'Authorization Error')
		}
	}

	return (
		<div className='sign-in'>
			<div className='sign-in-card'>
				<div className='sign-in__heading'>
					<img
						src='/images/logo-full.png'
						alt=''
						className='logo'
						data-aos='fade-up'
					/>
					<p
						className='fb-sm sign-in__title'
						data-aos='fade-up'
						data-aos-delay='50'
					>
						Welcome back! Login to ApexFinance
					</p>
				</div>
				<form action='#' className='sign-in__forms' onSubmit={handleSubmit}>
					<div className='forms-group' data-aos='fade-up' data-aos-delay='100'>
						<input
							type='email'
							className='form-control'
							id='email'
							value={formValues.email}
							onChange={handleChange}
							name='email'
							placeholder='Enter your email address'
						/>
					</div>
					<div className='forms-group' data-aos='fade-up' data-aos-delay='150'>
						<input
							type='password'
							className='form-control'
							id='password'
							value={formValues.password}
							onChange={handleChange}
							name='password'
							placeholder='Enter your password'
						/>
					</div>
					<div
						className='remember-forgot-password'
						data-aos='fade-up'
						data-aos-delay='200'
					>
						<div className='form-check'>
							<input
								type='checkbox'
								className='form-check-input'
								id='rememberPassword'
								name='rememberPassword'
								checked={formValues.rememberPassword} // Управляемое состояние
								onChange={handleChange} // Добавляем обработчик изменений
							/>
							<label className='form-check-label fb-sm'>
								Remember password
							</label>
						</div>
						<Link to='/forgot-password' className='forgot-password fb-sm'>
							Forgot password
						</Link>
					</div>
					<input
						type='submit'
						className='btn btn-primary btn-pill btn-submit'
						value='Sign In Now'
						data-aos='zoom-in-up'
						data-aos-delay='200'
					/>
					<p
						className='fb-sm sign-up-info'
						data-aos='fade-up'
						data-aos-delay='250'
					>
						Haven’t an account?{' '}
						<Link to='/sign-up' className='sign-up-link'>
							Sign up for free
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}
