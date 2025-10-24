import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AssetSearchState {
  query: string;
  filters: {
    type?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sortBy: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

const initialState: AssetSearchState = {
  query: '',
  filters: {},
  sortBy: {
    field: 'created_at',
    direction: 'desc',
  },
};

export const assetSearchSlice = createSlice({
  name: 'assetSearch',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<AssetSearchState['filters']>) => {
      state.filters = action.payload;
    },
    setSortBy: (state, action: PayloadAction<AssetSearchState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.filters = {};
      state.sortBy = {
        field: 'created_at',
        direction: 'desc',
      };
    },
  },
});

export const { setQuery, setFilters, setSortBy, clearSearch } = assetSearchSlice.actions;