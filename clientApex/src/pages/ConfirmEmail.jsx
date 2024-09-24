import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../services/authService'

export default function ConfirmEmailScreen() {
	const { token } = useParams() // Получаем токен из URL
	const navigate = useNavigate()
	const [status, setStatus] = useState('loading') // Загрузка, успешное подтверждение или ошибка

	useEffect(() => {
		const confirmEmail = async () => {
			try {
				await AuthService.confirmEmail(token) // Подтверждение email через API
				setStatus('success')
				setTimeout(() => navigate('/sign-in'), 3000) // Перенаправление на страницу входа через 3 секунды
			} catch (err) {
				console.error('Error confirming email:', err)
				setStatus('error')
			}
		}

		confirmEmail()
	}, [token, navigate])

	return (
		<div className='sign-in'>
			<div className='sign-in-card'>
				<div className='sign-in__heading'>
					<img src='/images/logo-full.png' alt='Logo' className='logo' />
					<h1 className='fb-sm sign-in__title'>
						{status === 'loading'
							? 'Confirming Your Email...'
							: status === 'success'
							? 'Email Confirmed'
							: 'Error'}
					</h1>
				</div>
				<div className='form-desc center'>
					{status === 'loading'
						? 'Please wait while we are confirming your email.'
						: status === 'success'
						? 'Your email has been confirmed successfully. You will be redirected to the login page shortly.'
						: 'There was an error confirming your email. Please try again later.'}
				</div>
				{status === 'error' && (
					<div className='center'>
						<p>
							If you continue to experience issues, please contact our support
							team.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
