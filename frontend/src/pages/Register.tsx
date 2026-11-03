import { useState } from 'react';
import { useNavigate } from "react-router";
import type { ChangeEvent, SubmitEvent } from "react";
import useFormData from "../utils/useFormData.ts";
import { useAuth } from "../utils/authContext.tsx";
import { emailError, hasErrors, passwordError, requiredError, type FieldErrors } from "../utils/validateUtil.ts";
import PasswordInput from "../components/PasswordInput.tsx";
import Alert from "react-bootstrap/Alert";
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
    const [errors, setErrors] = useState<FieldErrors<"username" | "email" | "password">>({});
    const [loading, setLoading] = useState(false);
    
    // Validerar formulärdata och uppdaterar felmeddelanden.
    function field(name: "username" | "email" | "password") {
        const attributes = formAttribute(name);
        return {
            ...attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                attributes.onChange(event);
                setErrors((prev) => ({ ...prev, [name]: undefined }));
                setError("");
            },
        };
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        const found: FieldErrors<"username" | "email" | "password"> = {
            username: requiredError(formData.username, "Fyll i användarnamn."),
            email: emailError(formData.email),
            password:
                requiredError(formData.password, "Fyll i lösenord.") ??
                passwordError(formData.password),
        };
        setErrors(found);
        if (hasErrors(found)) return;

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
                    <Form noValidate onSubmit={handleSubmit} className="mypage-panel">
                        <h2 className="mypage-panel-title">Bli medlem</h2>                        
                            <Form.Group className="mt-4" controlId="register-username">
                                <Form.Label>Användarnamn</Form.Label>
                                <Form.Control className="mt-2" {...field("username")} isInvalid={!!errors.username} placeholder="användarnamn" type="text" />
                                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mt-4" controlId="register-email">
                                <Form.Label>Epost</Form.Label>
                                <Form.Control className="mt-2" {...field("email")} isInvalid={!!errors.email} placeholder="epost" type="email" />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mt-4" controlId="register-password">
                                <Form.Label>Lösenord</Form.Label>
                                <div className="mt-2">
                                    <PasswordInput id="register-password" className="form-control" {...field("password")} invalid={!!errors.password} placeholder="lösenord" autoComplete="new-password" />
                                </div>
                                {errors.password && (
                                    <Form.Control.Feedback type="invalid" className="d-block">{errors.password}</Form.Control.Feedback>
                                )}
                            </Form.Group>

                            {error && <Alert variant="danger" className="py-2 mt-4 mb-0">{error}</Alert>}

                            <button className="mypage-btn mypage-btn-outline mt-4" type="submit" disabled={loading}>
                                {loading ? "Rigistreras..." : "Bli medlem"}
                            </button>                        
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