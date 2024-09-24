import { createSlice } from '@reduxjs/toolkit';

export const symbolSlice = createSlice({
  name: 'symbol',
  initialState: {
    selectedSymbol: 'BTC-USD',
    lastPrice: 0, // Добавлено для хранения последней цены
  },
  reducers: {
    setSelectedSymbol: (state, action) => {
      state.selectedSymbol = action.payload;
    },
    setLastPrice: (state, action) => {
      state.lastPrice = action.payload;
    },
  },
});

export const { setSelectedSymbol, setLastPrice } = symbolSlice.actions;

export const symbolReducer = symbolSlice.reducer;
export const selectSelectedSymbol = (state) => state.symbol.selectedSymbol;
export const selectLastPrice = (state) => state.symbol.lastPrice;
