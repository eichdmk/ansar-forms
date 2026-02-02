import { configureStore } from "@reduxjs/toolkit";
import formReducer from './slices/formSlices'

export const store = configureStore({
    reducer: {
        forms: formReducer
    }
})

export type RootState = ReturnType<typeof store.getState>