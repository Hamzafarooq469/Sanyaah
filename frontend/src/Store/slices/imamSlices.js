
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  imam: null,
  loading: false,
  error: null,
};

const imamSlice = createSlice({
  name: "imam",
  initialState,
  reducers: {
    setImam: (state, action) => {
      state.imam = action.payload;
      state.error = null;
    },
    clearImam: (state) => {
      state.imam = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setImam, clearImam, setLoading, setError } = imamSlice.actions;

export default imamSlice.reducer;