import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage';
import { apiSlice, errorHandler } from './api'

import tripSlice from './slices/trip.slice';
import authSlice from './slices/auth.slice';
import workSlice from './slices/work.slice';
import pvmDashboardSlice from './slices/pvm-dashboard.slice'


const authPersistConfig  = {
  key: 'auth',
  version: 1,
  storage,
}

const workPersistConfig = {
  key: 'workSession',
  version: 1,
  storage,
}

export const store = configureStore({
  reducer: combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth                  : persistReducer(authPersistConfig , authSlice),
    workSession           : persistReducer(workPersistConfig , workSlice),
    tripSlice             : tripSlice,
    pvmDashboardSlice     : pvmDashboardSlice

  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(apiSlice.middleware,errorHandler),
    devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)
export type RootState =  ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
