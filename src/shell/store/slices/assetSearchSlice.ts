import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AssetKind, ContentFilters, ContentSort } from '../../../lib/cms/types';

export type ViewMode = 'grid' | 'list';

interface AssetSearchState {
  filters: ContentFilters;
  sort: ContentSort;
  page: number;
  viewMode: ViewMode;
}

const initialState: AssetSearchState = {
  filters: {},
  sort: { field: 'created_at', direction: 'desc' },
  page: 1,
  viewMode: 'grid',
};

const assetSearchSlice = createSlice({
  name: 'assetSearch',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ContentFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setSort: (state, action: PayloadAction<ContentSort>) => {
      state.sort = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    updateFilter: (state, action: PayloadAction<{ key: keyof ContentFilters; value: any }>) => {
      const { key, value } = action.payload;
      if (value === undefined || value === '') {
        delete state.filters[key];
      } else {
        state.filters[key] = value;
      }
      state.page = 1; // Reset to first page when filters change
    },
    toggleKindFilter: (state, action: PayloadAction<AssetKind>) => {
      const kind = action.payload;
      const currentKinds = (state.filters.kinds as AssetKind[]) || [];
      
      if (currentKinds.includes(kind)) {
        // Remove the kind
        const newKinds = currentKinds.filter(k => k !== kind);
        if (newKinds.length === 0) {
          delete state.filters.kinds;
        } else {
          state.filters.kinds = newKinds;
        }
      } else {
        // Add the kind
        state.filters.kinds = [...currentKinds, kind];
      }
      state.page = 1; // Reset to first page when filters change
    },
  },
});

export const { setFilters, setSort, setPage, setViewMode, updateFilter, toggleKindFilter } = assetSearchSlice.actions;
export default assetSearchSlice.reducer;
