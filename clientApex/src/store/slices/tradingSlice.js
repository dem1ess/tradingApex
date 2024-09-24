import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { instance } from '../../services/api'

// Асинхронные действия для спотовой торговли
export const createSpotOrder = createAsyncThunk(
	'trading/createSpotOrder',
	async (order, { rejectWithValue }) => {
		try {
			const response = await instance.post('/spot/orders', order)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const fetchSpotPosition = createAsyncThunk(
	'trading/fetchSpotPosition',
	async (_, { rejectWithValue }) => {
		try {
			const response = await instance.get('/spot/positions')
			return response.data.positions // Возвращаем позиции
		} catch (error) {
			return rejectWithValue(
				error.response ? error.response.data : 'Unknown error'
			)
		}
	}
)

export const deleteSpotOrder = createAsyncThunk(
	'trading/deleteSpotOrder',
	async (orderId, { rejectWithValue }) => {
		try {
			await instance.delete(`/spot/orders/${orderId}`)
			return { orderId } // Возвращаем идентификатор удаленного ордера
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const updateSpotOrderStatus = createAsyncThunk(
	'trading/updateSpotOrderStatus',
	async ({ orderId, status }, { rejectWithValue }) => {
		try {
			const response = await instance.put(`/spot/orders/${orderId}/status`, {
				status,
			})
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const processSpotOrder = createAsyncThunk(
	'trading/processSpotOrder',
	async (order, { rejectWithValue }) => {
		try {
			const response = await instance.post('/spot/process-order', order)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const fetchSpotOrdersByUser = createAsyncThunk(
	'trading/fetchSpotOrdersByUser',
	async (userId, { rejectWithValue }) => {
		try {
			const response = await instance.get('/spot/orders', {
				params: { userId },
			})
			return response.data.orders // Возвращаем список ордеров
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

// Асинхронные действия для фьючерсной торговли
export const createFuturesOrder = createAsyncThunk(
	'trading/createFuturesOrder',
	async (order, { rejectWithValue }) => {
		try {
			const response = await instance.post('/futures/orders', order)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const updateFuturesOrderStatus = createAsyncThunk(
	'trading/updateFuturesOrderStatus',
	async ({ orderId, status }, { rejectWithValue }) => {
		try {
			const response = await instance.put(`/futures/orders/${orderId}/status`, {
				status,
			})
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const closeFuturesPosition = createAsyncThunk(
	'trading/closeFuturesPosition',
	async (data, { rejectWithValue }) => {
		try {
			const response = await instance.post('/futures/close', data)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const calculateProfitAndLoss = createAsyncThunk(
	'trading/calculateProfitAndLoss',
	async (data, { rejectWithValue }) => {
		try {
			const response = await instance.post(
				'/futures/calculate-profit-loss',
				data
			)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const fetchFuturesOrders = createAsyncThunk(
	'trading/fetchFuturesOrders',
	async (userId, { rejectWithValue }) => {
		try {
			const response = await instance.get('/futures/orders', {
				params: { userId },
			})
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

export const fetchFuturesPositions = createAsyncThunk(
	'trading/fetchFuturesPositions',
	async (userId, { rejectWithValue }) => {
		try {
			const response = await instance.get(`/futures/positions/${userId}`)
			return response.data // Возвращаем данные из ответа
		} catch (error) {
			return rejectWithValue(error.response.data) // Возвращаем ошибку, если она есть
		}
	}
)

const tradingSlice = createSlice({
	name: 'trading',
	initialState: {
		spotOrders: [],
		spotPositions: [],
		futuresOrders: [],
		futuresPositions: [],
		message: '',
		profitLoss: 0,
		status: 'idle',
		error: null,
	},
	reducers: {
		clearMessage: state => {
			state.message = ''
		},
	},
	extraReducers: builder => {
		builder
			// Обработка спотовых операций
			.addCase(fetchSpotOrdersByUser.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchSpotOrdersByUser.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.spotOrders = action.payload
			})
			.addCase(fetchSpotOrdersByUser.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(createSpotOrder.pending, state => {
				state.status = 'loading'
			})
			.addCase(createSpotOrder.fulfilled, (state, action) => {
				state.spotOrders.push(action.payload)
				state.message = 'Spot order created successfully'
				state.status = 'succeeded'
			})
			.addCase(createSpotOrder.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(updateSpotOrderStatus.pending, state => {
				state.status = 'loading'
			})
			.addCase(updateSpotOrderStatus.fulfilled, (state, action) => {
				const { orderId, status } = action.payload
				const order = state.spotOrders.find(o => o.id === orderId)
				if (order) {
					order.status = status
				}
				state.message = `Order status updated to ${status}`
				state.status = 'succeeded'
			})
			.addCase(updateSpotOrderStatus.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(deleteSpotOrder.pending, state => {
				state.status = 'loading'
			})
			.addCase(deleteSpotOrder.fulfilled, (state, action) => {
				state.spotOrders = state.spotOrders.filter(
					order => order.id !== action.payload.orderId
				)
				state.message = 'Spot order deleted successfully'
				state.status = 'succeeded'
			})
			.addCase(deleteSpotOrder.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(fetchSpotPosition.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchSpotPosition.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.spotPositions = action.payload
			})
			.addCase(fetchSpotPosition.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			// Обработка фьючерсных операций
			.addCase(fetchFuturesOrders.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchFuturesOrders.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.futuresOrders = action.payload
			})
			.addCase(fetchFuturesOrders.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(fetchFuturesPositions.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchFuturesPositions.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.futuresPositions = action.payload
			})
			.addCase(fetchFuturesPositions.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(createFuturesOrder.pending, state => {
				state.status = 'loading'
			})
			.addCase(createFuturesOrder.fulfilled, (state, action) => {
				state.futuresOrders.push(action.payload)
				state.message = 'Futures order created successfully'
				state.status = 'succeeded'
			})
			.addCase(createFuturesOrder.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(updateFuturesOrderStatus.pending, state => {
				state.status = 'loading'
			})
			.addCase(updateFuturesOrderStatus.fulfilled, (state, action) => {
				const { orderId, status } = action.payload
				const order = state.futuresOrders.find(o => o.id === orderId)
				if (order) {
					order.status = status
				}
				state.message = `Order status updated to ${status}`
				state.status = 'succeeded'
			})
			.addCase(updateFuturesOrderStatus.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(closeFuturesPosition.pending, state => {
				state.status = 'loading'
			})
			.addCase(closeFuturesPosition.fulfilled, (state, action) => {
				state.futuresPositions = state.futuresPositions.filter(
					position => position.id !== action.payload.positionId
				)
				state.message = 'Futures position closed successfully'
				state.status = 'succeeded'
			})
			.addCase(closeFuturesPosition.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(calculateProfitAndLoss.pending, state => {
				state.status = 'loading'
			})
			.addCase(calculateProfitAndLoss.fulfilled, (state, action) => {
				state.profitLoss = action.payload.profitLoss
				state.message = 'Profit and loss calculated successfully'
				state.status = 'succeeded'
			})
			.addCase(calculateProfitAndLoss.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
	},
})

export const { clearMessage } = tradingSlice.actions

export const tradingReducer = tradingSlice.reducer
