// src/store/slices/priceSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	prices: [], // Object to store price data keyed by symbol or pair
	status: 'idle',
	error: null,
}

const priceSlice = createSlice({
	name: 'prices',
	initialState,
	reducers: {
		setPrice(state, action) {
			const { symbol, priceData } = action.payload
			state.prices[symbol] = priceData
		},
		setAllPrices(state, action) {
			state.prices = action.payload
		},
		setStatus(state, action) {
			state.status = action.payload
		},
		setError(state, action) {
			state.error = action.payload
		},
		clearPrices(state) {
			state.prices = {}
		},
	},
})

export const { setPrice, setAllPrices, setStatus, setError, clearPrices } =
	priceSlice.actions
export default priceSlice.reducer
