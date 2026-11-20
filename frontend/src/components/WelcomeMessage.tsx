import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../utils/authContext.tsx";


export default function WelcomeMessage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const welcome = location.state?.welcome === true;


  useEffect(() => {
    if (!welcome) return;

    setIsVisible(true);

    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: null,
    });
  }, [welcome]); 


  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => setIsVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible || !user) return null;


  return (
    <div
      className="position-fixed start-50 translate-middle-x px-3"
      style={{ top: "6.5rem", zIndex: 1080, width: "min(100%, 560px)" }}
    >
      <Alert
        variant="success"
        dismissible
        onClose={() => setIsVisible(false)}
        closeLabel="Stäng"
        role="status"
        className="mb-0 shadow"
      >
        Välkommen, {user.username}! Ditt konto är skapat och du är inloggad.
      </Alert>
    </div>
  );
}
