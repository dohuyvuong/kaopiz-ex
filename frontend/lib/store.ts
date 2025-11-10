import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import authReducer from './features/auth/authSlice';
import sidebarReducer from './features/sidebar/sidebarSlice';
import { localStorage } from './storage';

const appReducer = combineReducers({
  auth: persistReducer(
    {
      key: 'auth',
      storage: localStorage,
    },
    authReducer,
  ),
  sidebar: persistReducer(
    {
      key: 'sidebar',
      storage: localStorage,
    },
    sidebarReducer,
  ),
});

export const makeStore = () => {
  const store = configureStore({
    reducer: appReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
