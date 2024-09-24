import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import '../assets/scss/pages/sign-in.scss' // Импорт стилей страницы
import { forgotPassword } from '../store/slices/authSlice' // Импортируем экшен для сброса пароля

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState('') // Состояние для email
	const dispatch = useDispatch()
	const { status, error } = useSelector(state => state.auth) // Получаем статус и ошибку из Redux

	// Обработчик изменения поля email
	const handleChange = e => {
		setEmail(e.target.value)
	}

	// Обработчик отправки формы
	const handleSubmit = async e => {
		e.preventDefault()
		if (!email) {
			toast.error('Please enter your email')
			return
		}
		// Отправляем запрос на сброс пароля через экшен
		dispatch(forgotPassword({ email }))
	}

	// Отслеживаем статус и выводим уведомления в зависимости от результата
	useEffect(() => {
		if (status === 'success') {
			toast.success('Password reset email has been sent successfully.')
		} else if (status === 'error' && error) {
			toast.error(error || 'Error sending password reset email.')
		}
	}, [status, error])

	return (
		<div className='sign-in'>
			<div className='sign-in-card'>
				<div className='sign-in__heading'>
					<img
						src='/images/logo-full.png'
						alt='Logo'
						className='logo'
						data-aos='fade-up'
					/>
					<h1
						className='fb-sm sign-in__title'
						data-aos='fade-up'
						data-aos-delay='50'
					>
						Forgot Password
					</h1>
				</div>

				<div
					className='form-desc center'
					data-aos='fade-up'
					data-aos-delay='100'
				>
					Please enter your email to reset your password.
				</div>

				<form className='sign-in__forms' onSubmit={handleSubmit}>
					<div className='forms-group' data-aos='fade-up' data-aos-delay='150'>
						<input
							type='email'
							className='form-control'
							id='email'
							placeholder='Enter your email'
							value={email}
							onChange={handleChange}
						/>
					</div>

					<input
						type='submit'
						className='btn btn-primary btn-pill btn-submit'
						value='Send Reset Link'
						data-aos='zoom-in-up'
						data-aos-delay='200'
					/>
				</form>
			</div>
		</div>
	)
}
