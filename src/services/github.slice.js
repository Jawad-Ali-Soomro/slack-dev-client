import { encryptData } from "@/utils/encryption";
import { createSlice } from "@reduxjs/toolkit";

const githubSlice = createSlice({
  name: "github",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    setGithubData: (state, action) => {
      state.data = encryptData(action.payload);
      state.loading = false;
      state.error = null;
    },

    setLoading: (state) => {
      state.loading = true;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearGithubData: (state) => {
      state.data = null;
    },
  },
});

export const {
  setGithubData,
  setLoading,
  setError,
  clearGithubData,
} = githubSlice.actions;

export default githubSlice.reducer;