import { useDispatch } from "react-redux";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useEffect } from "react";
import { formsAPI } from "../../api";
import { setForms } from "../../store/slices/formSlices";
import { CreateForm } from "../../components/CreateForm/CreateForm";

export function FormsPage(){
    const forms = useAppSelector(state=> state.forms.forms)

    const dispatch = useDispatch()


    useEffect(()=>{
        async function getForms() {
            const result = await formsAPI.getAll()
            dispatch(setForms(result))
        }

        getForms()
    }, [])

    return (
        <>
            <CreateForm/>
            <ul>
                {forms.map(f=>{
                    return <li key={f.id}>
                        {f.title}
                        {f.description}
                    </li>
                })}
            </ul>
        </>
    )
}