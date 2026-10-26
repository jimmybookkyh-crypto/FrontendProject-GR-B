
import {useState} from 'react';
import type {ChangeEvent} from 'react';

export default function useFormData<T extends Record<string, string>>(
    formValues: T
) {

    const initFormValues = {... formValues };
    const [formData, setFormData] = useState<T>(formValues);

    function formChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.currentTarget;

        setFormData({ ...formData, [name]: value });
    }  

    function formAttribute<K extends keyof T>(
        name: K, 
        required = true
    ) {
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