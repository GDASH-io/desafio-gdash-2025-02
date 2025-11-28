import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { authApi } from "@/modules/auth/api";
import { weatherApi } from "@/modules/weather/api";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, weatherApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
