import { useState } from 'react';
import { useLocation, useNavigate } from "react-router";
import type { ChangeEvent, SubmitEvent } from "react";
import useFormData from "../utils/useFormData.ts";
import { useAuth } from "../utils/authContext.tsx";
import { emailError, hasErrors, passwordError, requiredError, usernameError, type FieldErrors } from "../utils/validateUtil.ts";
import PasswordInput from "../components/PasswordInput.tsx";
import { getReturnTo } from "../utils/returnTo.ts";
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
    const location = useLocation();

    //sidan man kom ifrån (t.ex. Mina sidor), annars startsidan
    const from = getReturnTo(location.state);

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
            username: usernameError(formData.username),
            email: emailError(formData.email),
            password:
                requiredError(formData.password, "Fyll i lösenord.") ??
                passwordError(formData.password),
        };
        setErrors(found);
        if (hasErrors(found)) return;

        setLoading(true);

        try {
            const loggedIn = await register(formData.username, formData.email, formData.password);
            resetForm();

            if (loggedIn) {
                //inloggad direkt: tillbaka dit man var (annars startsidan), med välkomstmeddelande
                navigate(from, { replace: true, state: { welcome: true } });
            } else {
                //kontot är skapat men inloggningen misslyckades: till /login med ett meddelande
                navigate("/login", {
                    replace: true,
                    state: { from, notice: "Ditt konto är skapat. Logga in för att fortsätta." },
                });
            }
        } catch (error) {
            setError(
                error instanceof Error 
                ? error.message 
                : "Det gick inte att skapa kontot. Försök igen."
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
                  <Form.Control
                    className="mt-2"
                    {...field("username")}
                    isInvalid={!!errors.username}
                    placeholder="användarnamn"
                    type="text"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mt-4" controlId="register-email">
                  <Form.Label>E-post</Form.Label>
                  <Form.Control
                    className="mt-2"
                    {...field("email")}
                    isInvalid={!!errors.email}
                    placeholder="namn@exempel.se"
                    type="email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mt-4" controlId="register-password">
                  <Form.Label>Lösenord</Form.Label>
                  <div className="mt-2">
                    <PasswordInput
                      id="register-password"
                      className="form-control"
                      {...field("password")}
                      invalid={!!errors.password}
                      placeholder="lösenord"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.password}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                {error && (
                  <div className="invalid-feedback d-block mt-4">{error}</div>
                )}

                <button
                  className="mypage-btn mypage-btn-outline mt-4"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Skapar konto…" : "Bli medlem"}
                </button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    );
}

Register.route = {
  path: "/bli-medlem",
  order: 15, //vet inte vilket nummer ska vara här
  label: "Bli medlem",
};