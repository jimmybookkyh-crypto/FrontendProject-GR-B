import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "../utils/authContext.tsx";
import { userService } from "../utils/userService.ts";
import PasswordInput from "./PasswordInput.tsx";
import type { AuthUser } from "../interface/types.ts";

/* Mina uppgifter, Byt lösenord och Radera konto (T126 / #330).
   Fälten är låsta tills man klickar "Ändra mina uppgifter".
   Nuvarande lösenord krävs för att spara – det kontrolleras genom en ny inloggning,
   eftersom backend inte kontrollerar det själv än (T168, sprint 4). */

type FieldErrors = {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Samma regler som backend (hashPassword.ts): minst 8 tecken och högst 72 byte */
function passwordError(password: string): string | undefined {
  if (password.length < 8) return "Lösenordet måste vara minst 8 tecken.";
  if (new TextEncoder().encode(password).length > 72)
    return "Lösenordet är för långt.";
  return undefined;
}

export default function MyProfile({ user }: { user: AuthUser }) {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* Återställer formuläret till det som är sparat */
  function resetForm() {
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    setCurrentPassword("");
    setNewPassword("");
    setErrors({});
    setSaveError(null);
  }

  function toggleEditing() {
    if (editing) resetForm();
    setSuccess(null);
    setEditing(!editing);
  }

  function validate(): FieldErrors {
    const found: FieldErrors = {};
    const changed =
      username.trim() !== (user.username ?? "") ||
      email.trim().toLowerCase() !== (user.email ?? "").toLowerCase() ||
      newPassword !== "";

    if (username.trim() === "") found.username = "Fyll i ditt användarnamn.";
    if (!EMAIL_PATTERN.test(email.trim()))
      found.email = "Fyll i en giltig e-postadress, t.ex. namn@exempel.se.";
    if (newPassword !== "") found.newPassword = passwordError(newPassword);
    if (currentPassword === "")
      found.currentPassword = "Fyll i ditt nuvarande lösenord för att spara.";
    if (!changed && Object.values(found).every((e) => !e))
      found.username = "Du har inte ändrat något än.";

    return found;
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setSaveError(null);

    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setSaving(true);
    try {
      // 1. Rätt nuvarande lösenord? (mot det användarnamn som är sparat nu – inloggning sker med användarnamn, #371)
      await userService.verifyPassword(user.username, currentPassword);

      // 2. Spara. Byter man inte lösenord skickas det nuvarande, så det blir oförändrat.
      const updated = await userService.updateProfile(user.userId, {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: newPassword !== "" ? newPassword : currentPassword,
      });

      updateUser({ ...user, ...updated });
      setCurrentPassword("");
      setNewPassword("");
      setEditing(false);
      setSuccess(
        newPassword !== ""
          ? "Dina uppgifter och ditt lösenord är sparade."
          : "Dina uppgifter är sparade.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Något gick fel.";

      if (message === "Nuvarande lösenord stämmer inte.") {
        setErrors({ currentPassword: message });
      } else if (
        email.trim().toLowerCase() !== (user.email ?? "").toLowerCase()
      ) {
        // Backend svarar 500 om e-posten redan finns (#298), därför en tydligare text här
        setSaveError(
          "Kunde inte spara. E-postadressen kan redan vara kopplad till ett annat konto.",
        );
      } else {
        setSaveError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await userService.deleteAccount(user.userId);
      // Navigera först: annars hinner MyPage skicka en utloggad användare till /login
      navigate("/", { replace: true });
      logout();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Kontot kunde inte raderas.",
      );
      setDeleting(false);
    }
  }

  return (
    <>
      <Form noValidate onSubmit={handleSave} className="mypage-panel">
        <h2 className="mypage-panel-title">Mina uppgifter</h2>

        <Form.Group className="mb-3" controlId="mypage-username">
          <Form.Label>Användarnamn</Form.Label>
          <Form.Control
            type="text"
            autoComplete="name"
            value={username}
            disabled={!editing}
            isInvalid={!!errors.username}
            onChange={(e) => setUsername(e.target.value)}
            aria-describedby="mypage-username-help"
          />
          <Form.Control.Feedback type="invalid">
            {errors.username}
          </Form.Control.Feedback>
          {editing && !errors.username && (
            <Form.Text id="mypage-username-help" className="mypage-help">
              Du loggar in med ditt användarnamn.
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-4" controlId="mypage-email">
          <Form.Label>E-post</Form.Label>
          <Form.Control
            type="email"
            autoComplete="email"
            value={email}
            disabled={!editing}
            isInvalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <h2 className="mypage-panel-title">Byt lösenord</h2>

        <Form.Group className="mb-3" controlId="mypage-current-password">
          <Form.Label>Nuvarande lösenord</Form.Label>
          <PasswordInput
            id="mypage-current-password"
            className="form-control"
            autoComplete="current-password"
            value={currentPassword}
            disabled={!editing}
            invalid={!!errors.currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            aria-describedby="mypage-current-password-help"
          />
          {errors.currentPassword && (
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.currentPassword}
            </Form.Control.Feedback>
          )}
          {editing && !errors.currentPassword && (
            <Form.Text
              id="mypage-current-password-help"
              className="mypage-help"
            >
              Krävs för att spara ändringar.
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-4" controlId="mypage-new-password">
          <Form.Label>Nytt lösenord (minst 8 tecken)</Form.Label>
          <PasswordInput
            id="mypage-new-password"
            className="form-control"
            autoComplete="new-password"
            value={newPassword}
            disabled={!editing}
            invalid={!!errors.newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={editing ? "Lämna tomt om du inte vill byta" : ""}
          />
          {errors.newPassword && (
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.newPassword}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        {saveError && (
          <Alert variant="danger" className="py-2">
            {saveError}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="py-2" role="status">
            {success}
          </Alert>
        )}

        <div className="mypage-actions">
          <button
            type="button"
            className="mypage-btn mypage-btn-outline"
            onClick={toggleEditing}
            disabled={saving}
          >
            {editing ? "Avbryt" : "Ändra mina uppgifter"}
          </button>
          <button
            type="submit"
            className="mypage-btn mypage-btn-red"
            disabled={!editing || saving}
          >
            {saving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>
      </Form>

      <div className="text-center mt-4">
        <button
          type="button"
          className="mypage-btn mypage-btn-red mypage-btn-delete"
          onClick={() => setShowDelete(true)}
        >
          Radera mitt konto
        </button>
      </div>

      <Modal
        show={showDelete}
        onHide={() => !deleting && setShowDelete(false)}
        centered
        contentClassName="mypage-modal"
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title as="h2">Radera ditt konto?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Det här går inte att ångra.</p>
          <ul className="mb-0">
            <li>Dina kommande bokningar avbokas och platserna blir lediga.</li>
            <li>
              Din bokningshistorik sparas utan koppling till dig (anonymiseras).
            </li>
            <li>Du loggas ut direkt.</li>
          </ul>
          {deleteError && (
            <Alert variant="danger" className="py-2 mt-3 mb-0">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="mypage-btn mypage-btn-outline"
            onClick={() => setShowDelete(false)}
            disabled={deleting}
          >
            Avbryt
          </button>
          <button
            type="button"
            className="mypage-btn mypage-btn-red"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Raderar…" : "Ja, radera mitt konto"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
