import { encryptData } from "@/utils/encryption";
import { createSlice } from "@reduxjs/toolkit";

const githubSlice = createSlice({
  name: "github",
  initialState: {
    data: null,
    userId: null,
    githubUserId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setGithubData: (state, action) => {
      const { userId, githubUserId, data } = action.payload;
      state.data = encryptData(data);
      state.userId = userId ? String(userId) : null;
      state.githubUserId = githubUserId
        ? String(githubUserId)
        : data?.profile?.id
          ? String(data.profile.id)
          : null;
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
      state.userId = null;
      state.githubUserId = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setGithubData, setLoading, setError, clearGithubData } =
  githubSlice.actions;

export default githubSlice.reducer;
