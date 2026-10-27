
import { useState } from 'react';
import { useNavigate, Link  } from "react-router";
import type { SubmitEvent } from "react";

import useFormData from "../utils/useFormData.ts";

import { useAuth } from "../utils/authContext.tsx";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import "../styles/MyPage.css";

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

    return (
    <div className="mypage">
        <Container className="py-5 py-lg-5">
            <Row className="g-4 py-5 justify-content-md-center">
                <Col xs={12} lg={4}>
                    <Form onSubmit= {handleSubmit} className="mypage-panel">
                        <h2 className="mypage-panel-title">Logga in</h2>
                        <Form.Group className="mb-3" controlId="mypage-username">
                            <Form.Label className= "mt-4">Användarnamn</Form.Label>
                            <Form.Control className= "mt-2" {...formAttribute('username')} placeholder="användarnamn" type="text"/>

                            <Form.Label className= "mt-4">Lösenord</Form.Label>
                            <Form.Control className= "mt-2" {...formAttribute('password')} placeholder="lösenord" type="text"/>
                            {error && <p role="alert"> {error} </p>}

                            <button className="mypage-btn mypage-btn-outline mt-4" type="submit" disabled={loading}>
                                {loading ? "Loggar in..." : "Logga in"}
                            </button>
                        </Form.Group>
                        <Form.Text id="mypage-username-help" className="mypage-help ">
                            Inte redan medlem?
                            <Link className="ms-2" to="/bli-medlem">Bli medlem här</Link>
                        </Form.Text>
                    </Form>
                    
                </Col>
            </Row>
        </Container>
    </div> )
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
