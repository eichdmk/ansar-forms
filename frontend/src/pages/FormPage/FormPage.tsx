import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useEffect, useState } from "react";
import { formsAPI } from "../../api";
import { deleteForm, setForms, setSelectedForm } from "../../store/slices/formSlices";
import { CreateForm } from "../../components/CreateForm/CreateForm";
import type { AxiosError } from "axios";
import { Link } from "react-router-dom";

export function FormsPage() {
    const forms = useAppSelector(state => state.forms.forms)
    const [message, setMessage] = useState('')

    const dispatch = useDispatch()


    useEffect(() => {
        async function getForms() {
            const result = await formsAPI.getAll()
            dispatch(setForms(result))
        }

        getForms()
    }, [])

    async function handleSubmit(id: string) {
        try {
            await formsAPI.delete(id)
            dispatch(deleteForm({ id }))
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>

            if (!err.response) {
                return
            }
            setMessage(err.response.data.error || 'Произошла ошибка')
        }
    }


    return (
        <>
            <CreateForm />
            <ul>
                {forms.map(f => {
                    return <li>
                        <Link to={`/forms/${f.id}`} key={f.id}>
                            {f.title}
                            {f.description}
                        </Link>
                        <button onClick={() => dispatch(setSelectedForm(f))}>Редактировать</button>
                        <button onClick={() => handleSubmit(f.id)}>Удалить</button>
                        {message && <p>{message}</p>}
                    </li>
                })}
            </ul>
        </>
    )
}