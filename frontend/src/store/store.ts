import { configureStore } from "@reduxjs/toolkit";
import formReducer from './slices/formSlices'
import questionReducer from './slices/questionSlices'
import currentFormReducer from './slices/currentFormSlice'

export const store = configureStore({
    reducer: {
        forms: formReducer,
        questions: questionReducer,
        currentForm: currentFormReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>