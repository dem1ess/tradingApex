import { configureStore } from '@reduxjs/toolkit'
import { adminReducer } from './slices/adminSlice'
import { authReducer } from './slices/authSlice'
import { dialogReducer } from './slices/dialogSlice'
import { notificationReducer } from './slices/notificationSlice'
import { priceAdjustmentReducer } from './slices/priceAbjustment'
import priceReducer from './slices/pricesSlice'
import { robotReducer } from './slices/robotSlice'
import { symbolReducer } from './slices/symbolSlice'
import { tradeHistoryReducer } from './slices/tradeHistorySlice'
import { tradingReducer } from './slices/tradingSlice'
import { transactionReducer } from './slices/transactionSlice'

export const store = configureStore({
	reducer: {
		auth: authReducer,
		admin: adminReducer,
		notifications: notificationReducer,
		symbol: symbolReducer,
		trading: tradingReducer,
		transaction: transactionReducer,
		robots: robotReducer,
		priceAdjustments: priceAdjustmentReducer,
		tradeHistory: tradeHistoryReducer,
		dialog: dialogReducer,
		prices: priceReducer,
	},
})
