import { configureStore } from "@reduxjs/toolkit";
import formReducer from './slices/formSlices'
import questionReducer from './slices/questionSlices'

export const store = configureStore({
    reducer: {
        forms: formReducer,
        questions: questionReducer
    }
})

export type RootState = ReturnType<typeof store.getState>