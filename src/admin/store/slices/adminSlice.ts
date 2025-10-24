import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  globalSearch: string;
  timeRange: {
    start: string;
    end: string;
  };
  analyticsLoading: boolean;
  analyticsRefreshing: boolean;
}

const initialState: AdminState = {
  globalSearch: '',
  timeRange: {
    start: '',
    end: '',
  },
  analyticsLoading: false,
  analyticsRefreshing: false,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.timeRange = action.payload;
    },
    setAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.analyticsLoading = action.payload;
    },
    setAnalyticsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.analyticsRefreshing = action.payload;
    },
  },
});

export const { setGlobalSearch, setTimeRange, setAnalyticsLoading, setAnalyticsRefreshing } = adminSlice.actions;