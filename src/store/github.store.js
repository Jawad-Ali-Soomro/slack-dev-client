import { configureStore } from "@reduxjs/toolkit";
import githubReducer from "../services/github.slice";

export const store = configureStore({
  reducer: {
    github: githubReducer,
  },
});