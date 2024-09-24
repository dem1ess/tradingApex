import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { instance } from './../../services/api'

// Асинхронные действия для работы с API

// Получение списка роботов
export const fetchRobots = createAsyncThunk('robots/fetchRobots', async () => {
	const response = await instance.get('/robots')
	return response.data
})

// Подключение пользователя к роботу
export const connectRobot = createAsyncThunk(
	'robots/connectRobot',
	async ({ robotId, amount, period }, { rejectWithValue }) => {
		try {
			const response = await instance.post('/robots/connect', {
				robotId,
				amount,
				period,
			})
			return response.data
		} catch (error) {
			return rejectWithValue(error.response.data)
		}
	}
)

export const checkUserConnected = createAsyncThunk(
	'robots/checkUserConnected',
	async ({ robotId }, { rejectWithValue }) => {
		try {
			const response = await instance.get(`/robots/${robotId}/is-connected`)
			let userProfit = 0 // Значение по умолчанию для прибыли

			try {
				const profitResponse = await instance.get(`/robots/profits/${robotId}`)
				userProfit = profitResponse?.data.profit || 0 // Присваиваем прибыль или оставляем 0
			} catch (profitError) {
				console.warn(
					'Failed to fetch profit, setting default profit value to 0:',
					profitError
				)
			}

			return {
				robotId,
				isConnected: response.data.isConnected,
				transaction: response.data.transaction,
				userProfit, // Возвращаем прибыль или значение по умолчанию
			}
		} catch (error) {
			return rejectWithValue(
				error.response?.data || { error: 'Failed to check connection' }
			)
		}
	}
)

// Добавление нового ордера
export const addOrder = createAsyncThunk(
	'orders/addOrder',
	async (orderData, { rejectWithValue }) => {
		console.log(orderData)
		try {
			const response = await instance.post('robots/orders', orderData)
			console.log(orderData)
			return response.data
		} catch (error) {
			return rejectWithValue(error.response.data)
		}
	}
)

// Получение ордеров для конкретного робота
export const fetchOrdersByRobot = createAsyncThunk(
	'robots/fetchOrdersByRobot',
	async robotId => {
		try {
			const response = await instance.get(`/robots/orders/${robotId}`)
			// Предполагается, что API возвращает объект с полем 'orders'
			return { robotId, orders: response.data } // Данные должны быть в виде массива ордеров
		} catch (error) {
			console.error('Error fetching orders:', error)
			throw error
		}
	}
)

export const createRobot = createAsyncThunk(
	'robots/createRobot',
	async (robotData, { rejectWithValue }) => {
		try {
			const response = await instance.post('/robots/create', robotData)
			return response.data
		} catch (error) {
			return rejectWithValue(error.response.data)
		}
	}
)

// Получение прибыли пользователя по конкретному роботу
export const fetchUserProfit = createAsyncThunk(
	'profits/fetchUserProfit',
	async robotId => {
		const response = await instance.get(`/robots/profits/${robotId}`)
		console.log(response, '++++++++++++++++++++++++')
		return response.data
	}
)

// Получение прибыли пользователя по всем роботам
export const fetchAllUserProfits = createAsyncThunk(
	'profits/fetchAllUserProfits',
	async () => {
		const response = await instance.get('robots/profits')
		console.log(response)
		return response.data
	}
)

const robotSlice = createSlice({
	name: 'robots',
	initialState: {
		robots: [],
		ordersByRobot: {}, // Keyed by robotId
		userProfits: {},
		userProfit: null,
		robotDetails: null,
		status: 'idle',
		error: null,
	},
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchRobots.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchRobots.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.robots = action.payload
			})
			.addCase(fetchRobots.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			.addCase(connectRobot.pending, state => {
				state.status = 'loading'
			})
			.addCase(connectRobot.fulfilled, state => {
				state.status = 'succeeded'
			})
			.addCase(connectRobot.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(checkUserConnected.pending, state => {
				state.status = 'loading'
			})
			.addCase(checkUserConnected.fulfilled, (state, action) => {
				state.status = 'succeeded'
				const { robotId, isConnected, transaction, userProfit } = action.payload
				state.robots = state.robots.map(robot =>
					robot.id === robotId
						? { ...robot, isConnected, transaction, userProfit }
						: robot
				)
			})
			.addCase(checkUserConnected.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(addOrder.pending, state => {
				state.status = 'loading'
			})
			.addCase(addOrder.fulfilled, state => {
				state.status = 'succeeded'
			})
			.addCase(addOrder.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
			.addCase(fetchOrdersByRobot.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchOrdersByRobot.fulfilled, (state, action) => {
				state.status = 'succeeded'
				const { robotId, orders } = action.payload || {} // Добавляем проверку на существование
				if (robotId !== undefined) {
					state.ordersByRobot[robotId] = orders || [] // Обновляем состояние с ордерами
				}
			})
			.addCase(fetchOrdersByRobot.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			.addCase(fetchUserProfit.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchUserProfit.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.userProfit = action.payload
			})
			.addCase(fetchUserProfit.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			.addCase(fetchAllUserProfits.pending, state => {
				state.status = 'loading'
			})
			.addCase(fetchAllUserProfits.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.userProfits = action.payload
			})
			.addCase(fetchAllUserProfits.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.error.message
			})
			.addCase(createRobot.pending, state => {
				state.status = 'loading'
			})
			.addCase(createRobot.fulfilled, (state, action) => {
				state.status = 'succeeded'
				state.robots.push(action.payload) // Добавляем нового робота в список
			})
			.addCase(createRobot.rejected, (state, action) => {
				state.status = 'failed'
				state.error = action.payload || action.error.message
			})
	},
})

export const robotReducer = robotSlice.reducer
