import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { instance } from './../../services/api';

// Асинхронные действия для работы с API
export const setPriceAdjustment = createAsyncThunk(
  'priceAdjustments/setPriceAdjustment',
  async ({ symbol, adjustment }, { rejectWithValue }) => {
    try {
      const response = await instance.post('/admin/set-price-adjustment', { symbol, adjustment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPriceAdjustments = createAsyncThunk(
  'priceAdjustments/fetchPriceAdjustments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get('/admin/price-adjustments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const priceAdjustmentSlice = createSlice({
  name: 'priceAdjustments',
  initialState: {
    adjustments: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setPriceAdjustment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(setPriceAdjustment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Обновляем или добавляем корректировку в состояние
        const index = state.adjustments.findIndex((adj) => adj.symbol === action.payload.symbol);
        if (index !== -1) {
          state.adjustments[index] = action.payload;
        } else {
          state.adjustments.push(action.payload);
        }
      })
      .addCase(setPriceAdjustment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchPriceAdjustments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPriceAdjustments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.adjustments = action.payload;
      })
      .addCase(fetchPriceAdjustments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const priceAdjustmentReducer = priceAdjustmentSlice.reducer;
