import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Site {
  id: string;
  handle: string;
  label: string;
  default_locale: string;
  slug?: string;
}

interface SiteState {
  selectedSite: Site | null;
  sites: Site[];
  loading: boolean;
  error: string | null;
}

const initialState: SiteState = {
  selectedSite: null,
  sites: [],
  loading: false,
  error: null,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSites: (state, action: PayloadAction<Site[]>) => {
      state.sites = action.payload;
      // Auto-select first site if none selected
      if (!state.selectedSite && action.payload.length > 0) {
        state.selectedSite = action.payload[0];
      }
    },
    setSelectedSite: (state, action: PayloadAction<Site>) => {
      state.selectedSite = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSites, setSelectedSite, setLoading, setError } = siteSlice.actions;
export default siteSlice.reducer;