import { useState } from 'react';
import { useNavigate } from "react-router";
import type { SubmitEvent } from "react";


import useFormData from "../utils/useFormData.ts";

import { useAuth } from "../utils/authContext.tsx";

export default function Register() {
    const {
        formData,
        formAttribute,
        resetForm} = useFormData({
        username: '',
        email: '',
        password: ''
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(formData.username, formData.email, formData.password);
            resetForm();
            navigate("/login");
        } catch (error) {
            setError(
                error instanceof Error 
                ? error.message 
                : "Registrering misslyckades vid oväntat fel"
            );
        } finally {
            setLoading(false);
        }
    }

    return <>
        <form onSubmit= {handleSubmit}>
            <h1>Bli medlem</h1>
            <input {...formAttribute('username')} placeholder="username" type="text"/>
            <input {...formAttribute('email')} placeholder="email" type="text"/>
            <input {...formAttribute('password')} placeholder="lösenord" type="text"/>
            {error && <p role="alert"> {error} </p>}

            <button type="submit" disabled={loading}>
                {loading ? "Registrerar användare..." : "Registrera"}
            </button>

        </form>
    </>
}

Register.route = {
  path: "/bli-medlem",
  order: 15, //vet inte vilket nummer ska vara här
  label: "bli-medlem",
};