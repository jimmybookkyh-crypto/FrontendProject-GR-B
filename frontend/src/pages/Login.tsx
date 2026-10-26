
import { useState } from 'react';
import { useNavigate, Link  } from "react-router";
import type { SubmitEvent } from "react";

import useFormData from "../utils/useFormData.ts";

import { useAuth } from "../utils/authContext.tsx";

export default function Login() {
    const {
        formData,
        formAttribute,
        resetForm} = useFormData({
        username: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(formData.username, formData.password);
            resetForm();
            navigate("/"); //går till startsida, kanske byta till "min profil"
        } catch (error) {
            setError(
                error instanceof Error 
                ? error.message 
                : "Login misslyckades vid oväntat fel"
            );
        } finally {
            setLoading(false);
        }
    }

    return <>
        <form onSubmit= {handleSubmit}>
            <h1>Logga in</h1>
            <input {...formAttribute('username')} placeholder="användarnamn" type="text"/>
            <input {...formAttribute('password')} placeholder="lösenord" type="text"/>
            {error && <p role="alert"> {error} </p>}

            <button type="submit" disabled={loading}>
                {loading ? "Loggar in..." : "Logga in"}
            </button>

            <p>
                Inte redan medlem?          
                <Link to="/bli-medlem">Bli medlem här</Link>
            </p>
        </form>
    </>
}

Login.route = {
  path: "/login",
  order: 0,
  label: "Login",
};

/*
const username = "xX_SuperBertil_DragonSlayer_Xx";
    const email = "ImSoAmazingLiteralGod@gmail.com";
    const password = "SUPAtestOMG123!!";

    const { user, login, register, logout } = useAuth();

    async function handleRegister() {
        try {
            await register(username, email, password);
            console.log("Registreringen lyckades!");
        } catch (error) {
            console.error("Fel i register:", error);
        }
    }

    async function handleLogin() {
        try {
            await login(email, password);
            console.log("Login lyckades!");
        } catch (error) {
            console.error("Fel i login:", error);
        }
    }

    function handleLogout() {
        logout();
        console.log("Logout anropad.");
    }

    return (
        <div>
            <h1>Testa autentisering</h1>

            <p>
                Användare: {user ? user.username : "Inte inloggad"}
            </p>

            <button onClick={handleRegister}>
                Testa register
            </button>

            <button onClick={handleLogin}>
                Testa login
            </button>

            <button onClick={handleLogout}>
                Testa logout
            </button>
        </div>
    );
*/
