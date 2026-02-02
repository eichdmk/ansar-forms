import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Form } from "../../types";

const forms: Form[] = []
let selectedForm: Form | undefined

export const formSlice = createSlice({
    name: 'forms',
    initialState: {
        forms,
        selectedForm
    },
    reducers: {
        setForms: (state, actions: PayloadAction<Form[]>)=>{
            state.forms = actions.payload
        },
        addForm: (state, action: PayloadAction<Form>)=>{
            state.forms.push(action.payload)
        },
        updateForm: (state, action: PayloadAction<Form>)=>{
            state.forms = state.forms.map(f=> f.id === action.payload.id ? action.payload : f)
        },
        deleteForm: (state, action: PayloadAction<{id: string}>)=>{
            state.forms = state.forms.filter(f => f.id !== action.payload.id)
        },
        setSelectedForm: (state, action: PayloadAction<Form | undefined>)=>{
            state.selectedForm = action.payload
        }
    }
})

export const {setForms, addForm, updateForm, deleteForm, setSelectedForm} = formSlice.actions
export default formSlice.reducer