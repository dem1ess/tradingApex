import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { instance } from './../../services/api'

// Асинхронные действия для работы с пользователями
export const fetchBanUser = createAsyncThunk(
	'users/banUser',
	async ({ userId, reason }) => {
		const { data } = await instance.put(`/admin/ban/${userId}`, { reason })
		return { userId, ...data } // Возвращаем ID пользователя для обновления состояния
	}
)

export const fetchAllUsers = createAsyncThunk('users/getAllUsers', async () => {
	const { data } = await instance.get('/admin/get-all-users')
	return data
})

export const fetchUpdateUser = createAsyncThunk(
	'users/updateUser',
	async userData => {
		const { data } = await instance.put(
			`/admin/update-user/${userData.id}`,
			userData
		)
		return data
	}
)

const initialState = {
	users: [],
	status: 'idle',
	error: null,
}

const adminSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			// Ban user
			.addCase(fetchBanUser.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchBanUser.fulfilled, (state, action) => {
				state.status = 'succeeded'
				// Находим пользователя и обновляем поле is_banned
				const userIndex = state.users.findIndex(
					user => user.id === action.payload.userId
				)
				if (userIndex !== -1) {
					state.users[userIndex].is_banned = true
				}
			})
			.addCase(fetchBanUser.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Update main balance
			// .addCase(fetchUpdateMainBalance.pending, state => {
			// 	state.status = 'loading'
			// })
			// .addCase(fetchUpdateMainBalance.fulfilled, (state, action) => {
			// 	state.status = 'succeeded'
			// 	// Находим пользователя и обновляем main_balance
			// 	const userIndex = state.users.findIndex(
			// 		user => user.id === action.payload.userId
			// 	)
			// 	if (userIndex !== -1) {
			// 		state.users[userIndex].main_balance = action.payload.amount
			// 	}
			// })
			// .addCase(fetchUpdateMainBalance.rejected, (state, action) => {
			// 	state.status = 'failed'
			// 	state.error = action.error.message
			// })
			// // Add credit balance
			// .addCase(fetchAddCreditBalance.pending, state => {
			// 	state.status = 'loading'
			// })
			// .addCase(fetchAddCreditBalance.fulfilled, (state, action) => {
			// 	state.status = 'succeeded'
			// 	// Находим пользователя и добавляем к credit_balance
			// 	const userIndex = state.users.findIndex(
			// 		user => user.id === action.payload.userId
			// 	)
			// 	if (userIndex !== -1) {
			// 		state.users[userIndex].credit_balance += action.payload.amount
			// 	}
			// })
			// .addCase(fetchAddCreditBalance.rejected, (state, action) => {
			// 	state.status = 'failed'
			// 	state.error = action.error.message
			// })
			// Get all users
			.addCase(fetchAllUsers.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchAllUsers.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.users = action.payload
			})
			.addCase(fetchAllUsers.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Update user
			.addCase(fetchUpdateUser.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchUpdateUser.fulfilled, (state, action) => {
				state.status = 'succeeded'
				// Обновляем данные пользователя в состоянии
				const updatedUser = action.payload
				const userIndex = state.users.findIndex(
					user => user.id === updatedUser.id
				)
				if (userIndex !== -1) {
					state.users[userIndex] = updatedUser
				}
			})
			.addCase(fetchUpdateUser.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
	},
})

export const adminReducer = adminSlice.reducer
