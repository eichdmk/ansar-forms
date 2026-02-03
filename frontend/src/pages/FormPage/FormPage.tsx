import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useEffect, useState } from "react";
import { formsAPI } from "../../api";
import { deleteForm, setForms, setSelectedForm, updateForm } from "../../store/slices/formSlices";
import { CreateForm } from "../../components/CreateForm/CreateForm";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";

export function FormsPage() {
    const forms = useAppSelector(state => state.forms.forms)
    const [message, setMessage] = useState('')
    const selectedForm = useAppSelector(state => state.forms.selectedForm)
    const dispatch = useDispatch()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [is_published, setIs_published] = useState(false)

    useEffect(() => {
        if (selectedForm) {
            setTitle(selectedForm.title)
            setDescription(selectedForm.description)
            setIs_published(selectedForm.is_published)
        }
    }, [selectedForm])

    useEffect(() => {
        async function getForms() {
            const result = await formsAPI.getAll()
            dispatch(setForms(result))
        }
        getForms()
    }, [dispatch])

    async function handleDelete(id: string) {
        try {
            await formsAPI.delete(id)
            dispatch(deleteForm({ id }))
            if (selectedForm?.id === id) dispatch(setSelectedForm(undefined))
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data.error || 'Произошла ошибка')
            }
        }
    }

    async function handleSave() {
        if (!selectedForm) return
        try {
            const result = await formsAPI.update(selectedForm.id, { title, description, is_published })
            dispatch(updateForm(result))
            dispatch(setSelectedForm(undefined))
            setMessage('')
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>
            if (err.response) {
                setMessage(err.response.data.error || 'Произошла ошибка')
            }
        }
    }

    return (
        <>
            <CreateForm />
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {forms.map(f => {
                    const isEditing = selectedForm?.id === f.id
                    return (
                        <li key={f.id} style={{ marginBottom: 12 }}>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Название"
                                        style={{ marginRight: 8 }}
                                    />
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Описание"
                                        style={{ marginRight: 8 }}
                                    />
                                    <select
                                        value={is_published ? 'true' : 'false'}
                                        onChange={e => setIs_published(e.target.value === 'true')}
                                        style={{ marginRight: 8 }}
                                    >
                                        <option value="false">Черновик</option>
                                        <option value="true">Опубликовать</option>
                                    </select>
                                    <button type="button" onClick={handleSave}>Сохранить</button>
                                    <button type="button" onClick={() => dispatch(setSelectedForm(undefined))}>Отмена</button>
                                </>
                            ) : (
                                <>
                                    <Link to={`/forms/${f.id}`}>{f.title}</Link>
                                    {f.description && <span style={{ marginLeft: 8, color: '#666' }}>{f.description}</span>}
                                    <div style={{ display: 'inline-flex', gap: 8, marginLeft: 8 }}>
                                        <button type="button" onClick={() => dispatch(setSelectedForm(f))}>Редактировать</button>
                                        <button type="button" onClick={() => handleDelete(f.id)}>Удалить</button>
                                    </div>
                                </>
                            )}
                        </li>
                    )
                })}
            </ul>
            {message && <p>{message}</p>}
        </>
    )
}