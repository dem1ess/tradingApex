import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import '../assets/scss/pages/profile-v1.scss'
import {
	fetchVerifyToken2,
	updateUserProfile,
	uploadUserAvatar,
} from '../store/slices/authSlice'
import { COUNTRIES } from '../utils/countries'

export default function Profile() {
	const user = useSelector(state => state.auth.data)
	const dispatch = useDispatch()

	// Инициализация данных профиля
	const [userDetails, setUserDetails] = useState({
		first_name: user?.first_name || '',
		last_name: user?.last_name || '',
		email: user?.email || '',
		phone: user?.phone || '',
		date_of_birth: user?.date_of_birth ? new Date(user?.date_of_birth) : null,
		country: user?.country || COUNTRIES[0].value,
	})

	const [selectedCountry, setSelectedCountry] = useState(
		user?.country || COUNTRIES[0].value
	)
	const [avatar, setAvatar] = useState(null) // Состояние для аватарки
	const [dropdownOpen, setDropdownOpen] = useState(false)

	const handleInputChange = e => {
		const { name, value } = e.target
		setUserDetails(prevState => ({
			...prevState,
			[name]: value,
		}))
	}

	const handleDateChange = date => {
		setUserDetails(prevState => ({
			...prevState,
			date_of_birth: date,
		}))
	}

	const handleCountryChange = value => {
		setSelectedCountry(value)
		setUserDetails(prevState => ({
			...prevState,
			country: value,
		}))
	}

	const handleAvatarChange = e => {
		setAvatar(e.target.files[0]) // Сохраняем выбранный файл аватарки
	}

	useEffect(() => {
		if (selectedCountry) {
			setDropdownOpen(false)
		}
	}, [selectedCountry])

	const toggleDropdown = () => {
		setDropdownOpen(prev => !prev)
	}

	const calculateAge = birthDate => {
		const today = new Date()
		const birthDateObj = new Date(birthDate)
		let age = today.getFullYear() - birthDateObj.getFullYear()
		const monthDiff = today.getMonth() - birthDateObj.getMonth()

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDateObj.getDate())
		) {
			age--
		}
		return age
	}

	const handleSubmit = async e => {
		e.preventDefault()

		// Проверка возраста
		const age = calculateAge(userDetails.date_of_birth)
		if (age < 18) {
			toast.error('You must be at least 18 years old.')
			return
		}

		try {
			// Если выбрана новая аватарка, загружаем её
			if (avatar) {
				const formData = new FormData()
				formData.append('avatar', avatar)

				// Загружаем аватарку и обновляем профиль
				const response = await dispatch(uploadUserAvatar(formData)).unwrap()

				// Обновляем аватар в данных пользователя
				setUserDetails(prevState => ({
					...prevState,
					avatar_url: response.avatarUrl, // Обновляем URL аватара в состоянии
				}))
			}

			// Отправляем обновленные данные профиля
			await dispatch(updateUserProfile(userDetails)).unwrap()

			const token = localStorage.getItem('token')
			// Отправляем запрос на обновление профиля
			dispatch(fetchVerifyToken2(token))
			toast.success('Profile updated successfully!')
		} catch (error) {
			console.error('Error updating profile:', error)
		}
	}

	return (
		<div className='profile profile-v2'>
			<div className='container container--profile-v2'>
				<div className='profile__container'>
					<div className='profile__content'>
						<div className='profile__contact-info'>
							<div className='contact-info__photo-profile'>
								<div className='photo-profile__group' data-aos='fade-right'>
									<img
										src={
											userDetails.avatar_url
												? `http://localhost:3001${userDetails.avatar_url}` // Используем загруженный аватар
												: user?.avatar_url // Используем аватар, который уже есть у пользователя
												? `http://localhost:3001${user?.avatar_url}`
												: '/images/profile-photo.png' // Аватар по умолчанию
										}
										alt='Profile'
										className='photo-profile__group-photo'
									/>
									<div className='photo-profile__group-text'>
										<p className='fd-sm fd-sm--bold photo-profile__group-text-name'>
											{userDetails.first_name} {userDetails.last_name}
										</p>
										<p className='fb-sm photo-profile__group-text-email'>
											{userDetails.email}
										</p>
									</div>
								</div>
								<div className='photo-profile__cta'>
									<label className='btn btn-primary btn-sm btn-pill'>
										Change Photo Profile
										<input
											type='file'
											accept='image/*'
											onChange={handleAvatarChange}
											style={{ display: 'none' }}
										/>
									</label>
								</div>
							</div>
							<div className='contact-info__name-form'>
								<p className='fb-regular fb-regular--bold contact-info__name-form-text'>
									Phone
								</p>
								<div className='d-block mini-form-sm__box contact-info__name-form-input'>
									<input
										type='text'
										name='phone'
										className='form-control form-control-sm mini-form__input'
										value={userDetails.phone}
										onChange={handleInputChange}
										placeholder='Enter your phone number'
									/>
								</div>
							</div>
						</div>
						<div className='profile__personal-info'>
							<div className='personal-info__name-form'>
								<p className='fb-regular fb-regular--bold personal-info__name-form-text'>
									First name
								</p>
								<div className='d-block mini-form-sm__box personal-info__name-form-input'>
									<input
										type='text'
										name='first_name'
										className='form-control form-control-sm mini-form__input'
										value={userDetails.first_name}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<div className='personal-info__name-form'>
								<p className='fb-regular fb-regular--bold personal-info__name-form-text'>
									Last name
								</p>
								<div className='d-block mini-form-sm__box personal-info__name-form-input'>
									<input
										type='text'
										name='last_name'
										className='form-control form-control-sm mini-form__input'
										value={userDetails.last_name}
										onChange={handleInputChange}
									/>
								</div>
							</div>
							<div className='personal-info__name-form personal-info__name-form--date'>
								<p className='fb-regular fb-regular--bold personal-info__name-form-text'>
									Date of birth
								</p>
								<DatePicker
									selected={userDetails.date_of_birth}
									onChange={handleDateChange}
									className='form-control form-control-sm mini-form__input custom-datepicker-input'
									calendarClassName='custom-datepicker-calendar dark-datepicker'
									placeholderText='DD / MM / YYYY'
									dateFormat='dd / MM / yyyy'
								/>
							</div>
							<div className='personal-info__name-form personal-info__name-form--country'>
								<p className='fb-regular fb-regular--bold personal-info__name-form-text'>
									Country of residence
								</p>
								<div className='d-block'>
									<div
										className='forms-group forms-select js-forms-select'
										onClick={toggleDropdown}
									>
										<div className='forms-group__items selected'>
											<p className='fb-regular fg-items__value'>
												{
													COUNTRIES.find(
														country => country.value === selectedCountry
													)?.title
												}
											</p>
										</div>
										<img
											className='forms-select__arrow-down'
											src='/images/icons/arrow-down.svg'
											alt='Arrow Down'
										/>
										<div
											className={`forms-group__dropdown ${
												dropdownOpen ? 'is-open' : ''
											}`}
										>
											{COUNTRIES.map(country => (
												<div
													key={country.value}
													className={`forms-group__items ${
														selectedCountry === country.value ? 'active' : ''
													}`}
													onClick={() => handleCountryChange(country.value)}
												>
													<p className='fb-regular fg-items__value'>
														{country.title}
													</p>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
						<button
							className='btn btn-primary btn-lg btn-pill profile__save-btn'
							onClick={handleSubmit}
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
