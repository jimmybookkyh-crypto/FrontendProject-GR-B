import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../utils/authContext.tsx";

/* Välkomstmeddelande efter nyregistrering.
   Register skickar med state.welcome när användaren blivit inloggad direkt.
   Komponenten ligger i App och visas därför på den sida man hamnar på. */
export default function WelcomeMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visa, setVisa] = useState(false);

  const welcome = location.state?.welcome === true;

  // Visar meddelandet när Register har skickat med welcome
  useEffect(() => {
    if (!welcome) return;

    setVisa(true);

    // Tar bort state, annars visas meddelandet igen när sidan laddas om
    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: null,
    });
  }, [welcome]); // körs bara när welcome ändras

  // Försvinner av sig självt efter 6 sekunder
  useEffect(() => {
    if (!visa) return;

    const timer = setTimeout(() => setVisa(false), 6000);
    return () => clearTimeout(timer);
  }, [visa]);

  if (!visa || !user) return null;

  // Ligger över sidan (fixed) så att innehållet inte hoppar när rutan försvinner
  return (
    <div
      className="position-fixed start-50 translate-middle-x px-3"
      style={{ top: "6.5rem", zIndex: 1080, width: "min(100%, 560px)" }}
    >
      <Alert
        variant="success"
        dismissible
        onClose={() => setVisa(false)}
        closeLabel="Stäng"
        role="status"
        className="mb-0 shadow"
      >
        Välkommen, {user.username}! Ditt konto är skapat och du är inloggad.
      </Alert>
    </div>
  );
}
