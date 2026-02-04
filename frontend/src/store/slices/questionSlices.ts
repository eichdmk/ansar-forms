import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Question } from "../../types";

const questions: Question[] = []


const questionSlice = createSlice({
    name: 'question',
    initialState: {
        questions,
    },
    reducers: {
        setQuestions: (state, action: PayloadAction<Question[]>) => {
            state.questions = action.payload
        },
        addQuestion: (state, action: PayloadAction<Question>) => {
            state.questions.push(action.payload)
        },
        updateQuestion: (state, action: PayloadAction<Question>) => {
            state.questions = state.questions.map(q=> q.id === action.payload.id ? action.payload : q)
        },
        deleteQuestion: (state, action: PayloadAction<string>)=>{
            state.questions = state.questions.filter(q=> q.id !== action.payload)
        },

    }
})

export const {setQuestions, addQuestion, updateQuestion, deleteQuestion} = questionSlice.actions
export default questionSlice.reducer

