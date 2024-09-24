import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../assets/scss/pages/sign-up.scss'
import { fetchReg } from '../store/slices/authSlice'

export default function SignUp() {
	const navigate = useNavigate()
	const dispatch = useDispatch()

	// State for form values and error handling
	const [formValues, setFormValues] = useState({
		fName: '',
		lName: '',
		email: '',
		phone: '', // Добавляем поле для номера телефона
		pass: '',
		confirmPass: '',
		agreeTerms: false,
	})
	const [error, setError] = useState('')

	// Handle form input changes
	const handleChange = e => {
		const { name, value, type, checked } = e.target
		setFormValues(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
	}

	// Handle form submission
	const handleSubmit = async e => {
		e.preventDefault()
		if (!formValues.agreeTerms) {
			toast.error('You must agree to the Terms and Conditions.')
			return
		}
		if (formValues.pass !== formValues.confirmPass) {
			setError('Passwords do not match')
			return
		}

		const userData = {
			email: formValues.email,
			password: formValues.pass,
			first_name: formValues.fName,
			last_name: formValues.lName,
			phone: formValues.phone, // Добавляем поле телефона в данные для отправки
		}

		try {
			await dispatch(fetchReg(userData))
			// Задержка на 4 секунды перед переходом на страницу логина
			setTimeout(() => {
				navigate('/login') // Переход на страницу логина после задержки
			}, 4000) // 4 секунды (4000 миллисекунд)
		} catch (err) {
			console.error('Signup error:', err)
			toast.error('Error during signup')
		}
	}

	return (
		<div className='sign-up'>
			<div className='sign-up-card'>
				<div className='sign-up__heading'>
					<img src='/images/logo-full.png' alt='' className='logo' />
					<p className='fb-sm sign-up__title'>
						Let’s get started by filling out the form
					</p>
				</div>
				<form action='#' className='sign-up__forms' onSubmit={handleSubmit}>
					<div className='forms-name'>
						<div className='forms-group'>
							<input
								type='text'
								className='form-control'
								id='fName'
								name='fName'
								placeholder='Enter your first name'
								value={formValues.fName}
								onChange={handleChange}
								required
							/>
						</div>
						<div className='forms-group'>
							<input
								type='text'
								className='form-control'
								id='lName'
								name='lName'
								placeholder='Enter your last name'
								value={formValues.lName}
								onChange={handleChange}
								required
							/>
						</div>
					</div>
					<div className='forms-group'>
						<input
							type='email'
							className='form-control'
							id='email'
							name='email'
							placeholder='Enter your email'
							value={formValues.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='forms-group'>
						<input
							type='text'
							className='form-control'
							id='phone'
							name='phone'
							placeholder='Enter your phone number'
							value={formValues.phone}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='forms-group'>
						<input
							type='password'
							className='form-control'
							id='pass'
							name='pass'
							placeholder='Enter your password'
							value={formValues.pass}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='forms-group'>
						<input
							type='password'
							className='form-control'
							id='confirmPass'
							name='confirmPass'
							placeholder='Confirm your password'
							value={formValues.confirmPass}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='tnc'>
						<div className='form-check'>
							<input
								type='checkbox'
								className='form-check-input'
								id='agreeTerms'
								name='agreeTerms'
								checked={formValues.agreeTerms}
								onChange={handleChange}
							/>
							<label className='form-check-label fb-sm' htmlFor='agreeTerms'>
								I agree to the Terms and Conditions and the Trading Risk Notice
							</label>
						</div>
					</div>
					{error && <p className='error'>{error}</p>}
					<input
						type='submit'
						className='btn btn-primary btn-pill btn-submit'
						value='Sign Up Now'
					/>
					<p className='fb-sm sign-up-info'>
						Already have an account?{' '}
						<Link to='/sign-in' className='sign-up-link'>
							Sign in now
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}
