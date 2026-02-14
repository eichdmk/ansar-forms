import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Form } from "../../types"

type CurrentFormState = {
    formId: string | null
    form: Form | null
}

const initialState: CurrentFormState = {
    formId: null,
    form: null,
}

export const currentFormSlice = createSlice({
    name: "currentForm",
    initialState,
    reducers: {
        setCurrentForm: (
            state,
            action: PayloadAction<{ formId: string; form: Form }>
        ) => {
            state.formId = action.payload.formId
            state.form = action.payload.form
        },
        clearCurrentForm: (state) => {
            state.formId = null
            state.form = null
        },
        updateCurrentForm: (state, action: PayloadAction<Form>) => {
            if (state.form && state.form.id === action.payload.id) {
                state.form = action.payload
            }
        },
    },
})

export const {
    setCurrentForm,
    clearCurrentForm,
    updateCurrentForm,
} = currentFormSlice.actions
export default currentFormSlice.reducer
