import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { instance } from './../../services/api'; // Импортируйте ваш экземпляр API

// Thunk для получения всей истории сделок
export const fetchTradeHistory = createAsyncThunk(
  'tradeHistory/fetchTradeHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await instance.get('/trade-history/history', {});
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk для получения истории сделок по символу
export const fetchTradeHistoryBySymbol = createAsyncThunk(
  'tradeHistory/fetchTradeHistoryBySymbol',
  async (symbol, { getState, rejectWithValue }) => {
    try {
      const { data } = await instance.get(`/trade-history/history/${symbol}`, {});
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  trades: [],
  status: 'idle',
  error: null,
};

const tradeHistorySlice = createSlice({
  name: 'tradeHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTradeHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trades = action.payload;
      })
      .addCase(fetchTradeHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTradeHistoryBySymbol.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTradeHistoryBySymbol.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trades = action.payload;
      })
      .addCase(fetchTradeHistoryBySymbol.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectTradeHistory = (state) => state.tradeHistory.trades;
export const selectTradeHistoryStatus = (state) => state.tradeHistory.status;
export const selectTradeHistoryError = (state) => state.tradeHistory.error;

export const tradeHistoryReducer = tradeHistorySlice.reducer;
