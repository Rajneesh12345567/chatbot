import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"; // or wherever your auth slice is
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { combineReducers } from "redux";

// Only persist auth slice, and only selected keys like isAuthenticated
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "user"], // DO NOT include 'password' or sensitive fields
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  // add other reducers here if needed
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }),
});

export const persistor = persistStore(store);
