import { useState, type InputHTMLAttributes } from "react";
import "../styles/PasswordInput.css";

/* Lösenordsfält med ögon-knapp som visar eller döljer lösenordet.
   Fungerar som ett vanligt <input>: alla vanliga props (value, onChange, name,
   placeholder, autoComplete, id, className …) skickas vidare.

   Användning:
     <PasswordInput id="login-password" className="form-control" value={…} onChange={…} />
     <PasswordInput {...formAttribute("password")} placeholder="lösenord" />

   invalid = true ger Bootstraps röda ram (is-invalid). Felmeddelandet läggs utanför
   komponenten med className="d-block", eftersom fältet ligger i en egen wrapper. */

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  invalid?: boolean;
};

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

export default function PasswordInput({
  className = "",
  invalid = false,
  disabled,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={`${className}${invalid ? " is-invalid" : ""}`}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Dölj lösenord" : "Visa lösenord"}
        aria-pressed={visible}
        title={visible ? "Dölj lösenord" : "Visa lösenord"}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
