import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import { instance } from './../../services/api'

// Асинхронные действия для работы с уведомлениями
export const fetchSendNotification = createAsyncThunk(
	'notifications/sendNotification',
	async ({ userId, message }) => {
		const { data } = await instance.post('/notifications/send', {
			userId,
			message,
		})
		return data
	}
)

export const fetchGetNotifications = createAsyncThunk(
	'notifications/getNotifications',
	async userId => {
		const { data } = await instance.get(`/notifications/${userId}`)
		return data
	}
)

export const fetchMarkAsRead = createAsyncThunk(
	'notifications/markAsRead',
	async notificationId => {
		const { data } = await instance.put(`/notifications/read/${notificationId}`)
		return data
	}
)

const initialState = {
	notifications: [],
	status: 'idle',
	error: null,
}

const notificationSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			// Send notification
			.addCase(fetchSendNotification.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchSendNotification.fulfilled, state => {
				state.status = 'succeeded'
				toast.success('Notification sent successfully!')
			})
			.addCase(fetchSendNotification.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload
				toast.error('Failed to send notification')
			})
			// Get notifications
			.addCase(fetchGetNotifications.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchGetNotifications.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.notifications = action.payload
			})
			.addCase(fetchGetNotifications.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Mark notification as read
			.addCase(fetchMarkAsRead.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchMarkAsRead.fulfilled, state => {
				state.status = 'succeeded'
			})
			.addCase(fetchMarkAsRead.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
	},
})

export const { clearNotifications } = notificationSlice.actions
export const notificationReducer = notificationSlice.reducer
