import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { instance } from './../../services/api'

// Обновленный метод для получения профиля пользователя с токеном
const getUserProfile = async token => {
	const { data } = await instance.get('/auth/profile')
	data.token = token // Добавляем токен в возвращаемые данные
	return data
}

export const forgotPassword = createAsyncThunk(
	'auth/forgotPassword',
	async ({ email }, { rejectWithValue }) => {
		try {
			const response = await instance.post('/auth/forgot-password', { email })
			toast.success('Password reset email sent.')
			return response.data
		} catch (error) {
			toast.error('Error sending password reset email.')
			return rejectWithValue(
				error.response?.data || { message: 'Error sending reset email' }
			)
		}
	}
)

// Функция для удаления токена из localStorage
export function removeTokenFromLocalStorage() {
	localStorage.removeItem('token')
}

// Обновленный thunk для проверки токена
export const fetchVerifyToken2 = createAsyncThunk(
	'auth/verifyToken',
	async (token, { rejectWithValue, dispatch }) => {
		try {
			// Получаем профиль пользователя
			const data = await getUserProfile(token)

			// Проверяем, забанен ли пользователь
			if (data.is_banned) {
				// Если пользователь забанен, вызываем action для разлогина
				dispatch(logout())
				return rejectWithValue({ message: 'User is banned' })
			}

			// Если пользователь не забанен, возвращаем данные профиля
			return data
		} catch (error) {
			// Обрабатываем другие ошибки
			return rejectWithValue(
				error.response?.data || { message: 'Error verifying token' }
			)
		}
	}
)

export const fetchAuth = createAsyncThunk(
	'auth/fetchUserData',
	async (params, { rejectWithValue }) => {
		try {
			const { data } = await instance.post('/auth/login', params)
			return data
		} catch (error) {
			// Возвращаем ошибку, чтобы она была доступна в action.payload
			return rejectWithValue(error.response.data)
		}
	}
)

export const updateUserProfile = createAsyncThunk(
	'auth/updateUserProfile',
	async (userDetails, { rejectWithValue }) => {
		try {
			const { data } = await instance.put('/auth/profile', userDetails)
			toast.success('Profile updated successfully')
			return data
		} catch (error) {
			toast.error('Error updating profile')
			return rejectWithValue(error.response.data)
		}
	}
)

export const uploadUserAvatar = createAsyncThunk(
	'auth/uploadUserAvatar',
	async (formData, { rejectWithValue }) => {
		try {
			const { data } = await instance.post('/auth/upload-avatar', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			toast.success('Avatar uploaded successfully')
			return data
		} catch (error) {
			toast.error('Error uploading avatar')
			return rejectWithValue(error.response.data)
		}
	}
)

export const fetchReg = createAsyncThunk(
	'auth/fetchRegistration',
	async params => {
		const { data } = await instance.post('/auth/register', params)
		toast.success('Please check your email to confirm your account.')
		return data
	}
)

const initialState = {
	data: null,
	status: 'idle',
	error: null,
	isAuth: false,
	isCheckingAuth: true, // Добавлено новое состояние
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout: state => {
			state.data = null
			state.status = 'idle'
			state.error = null
			state.isAuth = false
			state.isCheckingAuth = false // Обновляем состояние
			removeTokenFromLocalStorage() // Вызываем функцию удаления токена
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchAuth.pending, state => {
				state.status = 'loading'
				state.data = null
				state.error = null
			})
			.addCase(fetchAuth.fulfilled, (state, action) => {
				state.status = 'loaded'
				state.data = action.payload
				state.isAuth = true
				state.isCheckingAuth = false // Обновляем состояние
			})
			.addCase(fetchAuth.rejected, (state, action) => {
				state.status = 'error'
				state.data = null
				// Сохраняем ошибку для отображения
				state.error = action.payload?.error || 'Authorization failed'
				state.isCheckingAuth = false // Обновляем состояние
			})
			.addCase(fetchVerifyToken2.pending, state => {
				state.status = 'loading'
				state.data = null
				state.error = null
			})
			.addCase(fetchVerifyToken2.fulfilled, (state, action) => {
				state.status = 'loaded'
				state.data = action.payload
				state.isAuth = true
				state.isCheckingAuth = false // Update to false
			})
			.addCase(fetchVerifyToken2.rejected, (state, action) => {
				state.status = 'error'
				state.data = null
				state.error = action.payload
				state.isCheckingAuth = false // Update to false
			})
			.addCase(updateUserProfile.pending, state => {
				state.status = 'loading'
			})
			.addCase(updateUserProfile.fulfilled, (state, action) => {
				state.status = 'loaded'
				state.data = { ...state.data, ...action.payload }
			})
			.addCase(updateUserProfile.rejected, (state, action) => {
				state.status = 'error'
				state.error = action.payload
			})
			.addCase(uploadUserAvatar.fulfilled, (state, action) => {
				state.status = 'loaded'
				state.data.avatar_url = action.payload.avatarUrl // Обновляем URL аватарки
			})
			.addCase(uploadUserAvatar.rejected, (state, action) => {
				state.status = 'error'
				state.error = action.payload
			})
			.addCase(forgotPassword.pending, state => {
				state.status = 'loading'
				state.error = null
			})
			.addCase(forgotPassword.fulfilled, state => {
				state.status = 'success'
			})
			.addCase(forgotPassword.rejected, (state, action) => {
				state.status = 'error'
				state.error = action.payload?.message || 'Error processing request'
			})
	},
})

export const { logout } = authSlice.actions
export const authReducer = authSlice.reducer
