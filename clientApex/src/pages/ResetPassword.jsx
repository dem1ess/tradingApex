/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../assets/scss/pages/sign-in.scss' // Импорт стилей страницы входа
import { AuthService } from '../services/authService'

export default function ResetPasswordScreen() {
	const { token } = useParams() // Получаем токен сброса пароля из URL
	const navigate = useNavigate() // Для перенаправления после успешного сброса
	const [newPassword, setNewPassword] = useState('') // Состояние для нового пароля
	const [error, setError] = useState(null) // Состояние для ошибки
	const [success, setSuccess] = useState(false) // Состояние для успеха сброса пароля

	// Обработчик изменения пароля
	const handleChange = e => {
		setNewPassword(e.target.value)
	}

	// Обработчик отправки формы сброса пароля
	const handleSubmit = async e => {
		e.preventDefault()
		try {
			await AuthService.resetPassword({ token, newPassword }) // Сброс пароля через AuthService
			setSuccess(true)
			setError(null)
			// Перенаправляем на страницу входа через 3 секунды после успешного сброса
			setTimeout(() => navigate('/login'), 3000)
		} catch (err) {
			setError('Error resetting password. Please try again.')
			setSuccess(false)
		}
	}

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
						Reset Password
					</h1>
				</div>

				<div
					className='form-desc center'
					data-aos='fade-up'
					data-aos-delay='100'
				>
					{success
						? 'Password has been reset successfully. Redirecting to login page...'
						: 'Please enter your new password.'}
				</div>

				{error && (
					<div className='center'>
						<p className='error-message'>{error}</p>
					</div>
				)}

				{!success && (
					<form className='sign-in__forms' onSubmit={handleSubmit}>
						<div
							className='forms-group'
							data-aos='fade-up'
							data-aos-delay='150'
						>
							<input
								type='password'
								className='form-control'
								id='newPassword'
								placeholder='Enter your new password'
								value={newPassword}
								onChange={handleChange}
							/>
						</div>

						<input
							type='submit'
							className='btn btn-primary btn-pill btn-submit'
							value='Reset Password'
							data-aos='zoom-in-up'
							data-aos-delay='200'
						/>
					</form>
				)}
			</div>
		</div>
	)
}
