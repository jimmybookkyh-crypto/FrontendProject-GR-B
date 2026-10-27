import { useState } from 'react';
import { useNavigate } from "react-router";
import type { SubmitEvent } from "react";

import useFormData from "../utils/useFormData.ts";

import { useAuth } from "../utils/authContext.tsx";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import "../styles/MyPage.css";

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

    return (
    <div className="mypage">
        <Container className="py-5 py-lg-5">
            <Row className="g-4 py-5 justify-content-md-center">
                <Col xs={12} lg={4}>
                    <Form onSubmit= {handleSubmit} className="mypage-panel">
                        <h2 className="mypage-panel-title">Bli medlem</h2>
                        <Form.Group className="mb-3" controlId="mypage-username">
                            <Form.Label className= "mt-4">Användarnamn</Form.Label>
                            <Form.Control className= "mt-2" {...formAttribute('username')} placeholder="användarnamn" type="text"/>

                            <Form.Label className= "mt-4">Epost</Form.Label>
                            <Form.Control className= "mt-2" {...formAttribute('email')} placeholder="epost" type="text"/>

                            <Form.Label className= "mt-4">Lösenord</Form.Label>
                            <Form.Control className= "mt-2" {...formAttribute('password')} placeholder="lösenord" type="text"/>
                            {error && <p role="alert"> {error} </p>}

                            <button className="mypage-btn mypage-btn-outline mt-4" type="submit" disabled={loading}>
                                {loading ? "Rigistreras..." : "Bli medlem"}
                            </button>
                        </Form.Group>
                    </Form>
                    
                </Col>
            </Row>
        </Container>
    </div> )
}

Register.route = {
  path: "/bli-medlem",
  order: 15, //vet inte vilket nummer ska vara här
  label: "bli-medlem",
};