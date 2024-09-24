import { setTokenToLocalStorage } from '../helpers/localstorage.helper'
import { instance } from './api'

export const AuthService = {
	async registration(userData) {
		console.log('Sending request with userData:', userData)
		try {
			const { data } = await instance.post('auth/register', userData)
			console.log('Received response:', data)
			return data
		} catch (error) {
			console.error('Error during registration:', error)
			throw error
		}
	},

	async login(userData) {
		console.log('Sending request with userData:', userData)
		try {
			const { data } = await instance.post('auth/login', userData)
			console.log('Received response:', data.token)
			setTokenToLocalStorage(data.token)
			return data
		} catch (error) {
			console.error('Error during login:', error)
			throw error
		}
	},

	async forgotPassword(email) {
		const { data } = await instance.post('auth/forgot-password', email)
		if (data) return data
	},

	async resetPassword({ token, newPassword }) {
		const { data } = await instance.post('auth/reset-password', {
			token,
			newPassword,
		})
		if (data) return data
	},

	async confirmEmail(token) {
		const { data } = await instance.get(`auth/verify/${token}`)
		if (data) return data
	},
}
