
import { useState } from 'react';
import { useNavigate, Link  } from "react-router";
import type { ChangeEvent, SubmitEvent } from "react";
import useFormData from "../utils/useFormData.ts";
import { useAuth } from "../utils/authContext.tsx";
import { hasErrors, requiredError, type FieldErrors } from "../utils/validateUtil.ts";
import PasswordInput from "../components/PasswordInput.tsx";
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
    const [errors, setErrors] = useState<FieldErrors<"username" | "password">>({});
    const [loading, setLoading] = useState(false);
    
    // Validerar formulärdata och uppdaterar felmeddelanden.
    function field(name: "username" | "password") {
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
        const found: FieldErrors<"username" | "password"> = {
            username: requiredError(formData.username, "Fyll i ditt användarnamn."),
            password: requiredError(formData.password, "Fyll i ditt lösenord."),
        };
        setErrors(found);
        if (hasErrors(found)) return;

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
                    <Form noValidate onSubmit={handleSubmit} className="mypage-panel">
                        <h2 className="mypage-panel-title">Logga in</h2>                        
                            <Form.Group className="mt-4" controlId="login-username">
                                <Form.Label>Användarnamn</Form.Label>
                                <Form.Control className="mt-2" {...field("username")} isInvalid={!!errors.username} placeholder="användarnamn" type="text" autoComplete="username" />
                                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mt-4" controlId="login-password">
                                <Form.Label>Lösenord</Form.Label>
                                <div className="mt-2">
                                    <PasswordInput id="login-password" className="form-control" {...field("password")} invalid={!!errors.password} placeholder="lösenord" autoComplete="current-password" />
                                </div>
                                {errors.password && (
                                    <Form.Control.Feedback type="invalid" className="d-block">{errors.password}</Form.Control.Feedback>
                                )}
                            </Form.Group>

                            {error && <div className="invalid-feedback d-block mt-4">{error}</div>}

                            <button className="mypage-btn mypage-btn-outline mt-4" type="submit" disabled={loading}>
                                {loading ? "Loggar in..." : "Logga in"}
                            </button>                   
                            <Form.Text id="login-help" className="mypage-help d-block mt-3">
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
