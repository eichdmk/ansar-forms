import React, { useState } from 'react'
import { formsAPI } from '../../api'
import { useDispatch } from 'react-redux'
import { addForm } from '../../store/slices/formSlices'
import type { AxiosError } from "axios";


export function CreateForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [is_published, setIs_published] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const dispatch = useDispatch()



    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        setLoading(true)

        try {
            const result = await formsAPI.create({ title, description, is_published })
            dispatch(addForm(result))
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (!err.response) {
                return
            }
            setMessage(err.response.data.error ?? 'Произошла ошибка')
            console.error(err.response.data.error ?? 'Произошла ошибка')
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
                <select
                    value={is_published ? 'true' : 'false'}
                    onChange={e => setIs_published(e.target.value === 'true')}
                >
                    <option value="false">Черновик</option>
                    <option value="true">Опубликовать</option>
                </select>
                <button disabled={loading}>Добавить</button>
            </form >
            {message && <p>{message}</p>}
        </>
    )
}