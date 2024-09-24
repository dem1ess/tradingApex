import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { instance } from './../../services/api'

// Асинхронные действия для работы с транзакциями
export const fetchCreateTransaction = createAsyncThunk(
	'transactions/createTransaction',
	async ({ userId, type, amount, cryptoWallet, walletTicker }) => {
		console.log(userId, type, amount, cryptoWallet, walletTicker)

		const { data } = await instance.post('/transactions/', {
			userId,
			type,
			amount,
			cryptoWallet,
			walletTicker, // Теперь указываем кошелек
		})
		return data
	}
)

export const fetchUpdateTransactionStatus = createAsyncThunk(
	'transactions/updateTransactionStatus',
	async ({ transactionId, status, newCryptoWallet }) => {
		const { data } = await instance.post(
			`/transactions/${transactionId}/status`,
			{
				status,
				newCryptoWallet,
			}
		)
		return data
	}
)

export const fetchGetTransactionsByUser = createAsyncThunk(
	'transactions/getTransactionsByUser',
	async userId => {
		const { data } = await instance.get(`/transactions/user/${userId}`)
		return data
	}
)

export const fetchGetAllTransactions = createAsyncThunk(
	'transactions/getAllTransactions',
	async () => {
		const { data } = await instance.get('/transactions/all')
		return data
	}
)

const initialState = {
	transactions: [],
	status: 'idle',
	error: null,
}

const transactionSlice = createSlice({
	name: 'transaction',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			// Create transaction
			.addCase(fetchCreateTransaction.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchCreateTransaction.fulfilled, (state, action) => {
				state.status = 'succeeded'
				// Добавляем только что созданную транзакцию в состояние
				if (action.payload && action.payload.transactionId) {
					state.transactions = [...state.transactions, action.payload]
				}
			})
			.addCase(fetchCreateTransaction.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Update transaction status
			.addCase(fetchUpdateTransactionStatus.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchUpdateTransactionStatus.fulfilled, (state, action) => {
				state.status = 'succeeded'
				// Обновляем статус транзакции в состоянии
				const index = state.transactions.findIndex(
					t => t.id === action.payload.transactionId
				)
				if (index !== -1) {
					state.transactions[index] = action.payload
				}
			})
			.addCase(fetchUpdateTransactionStatus.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Get transactions by user
			.addCase(fetchGetTransactionsByUser.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchGetTransactionsByUser.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.transactions = action.payload
			})
			.addCase(fetchGetTransactionsByUser.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			// Get all transactions
			.addCase(fetchGetAllTransactions.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchGetAllTransactions.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.transactions = action.payload
			})
			.addCase(fetchGetAllTransactions.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
	},
})

export const transactionReducer = transactionSlice.reducer
