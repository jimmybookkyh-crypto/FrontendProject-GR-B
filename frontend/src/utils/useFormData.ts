
import {useState} from 'react';

export default function useFormData(formValues) {

    const initFormValues = {... formValues };
    const [formData, setFormData] = useState(formValues);

    function formChange(event) {
        const { name, value } = event.currentTarget;

        setFormData({ ...formData, [name]: value });
    }  

    function formAttribute(name, required = true) {
        return {
            name,
            value: formData[name],
            onChange: formChange,
            required
        };
    }

    function resetForm() {
        setFormData({ ...initFormValues});
    }

    return {
        formData,
        setFormData,
        formAttribute,
        resetForm,
    };
}