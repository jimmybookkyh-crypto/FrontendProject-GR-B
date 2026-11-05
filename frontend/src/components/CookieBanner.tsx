import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  getCookieConsent,
  saveCookieConsent,
  CONSENT_CHANGED_EVENT,
} from "../utils/cookieConsent";
import "../styles/buttons.css";


export default function CookieBanner() {
  const [visible, setVisible] = useState(() => getCookieConsent() === null);
  const bannerRef = useRef<HTMLElement>(null);

  
  useEffect(() => {
    const handleChange = () => setVisible(getCookieConsent() === null);
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!visible || !banner) return;

    const updatePadding = () => {
      document.body.style.paddingBottom = `${banner.offsetHeight}px`;
    };
    updatePadding();

    const observer = new ResizeObserver(updatePadding);
    observer.observe(banner);

    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  if (!visible) return null;

  const handleChoice = (statistics: boolean) => {
    saveCookieConsent(statistics);
    setVisible(false);
  };

  return (
    <section
      ref={bannerRef}
      aria-label="Cookies"
      className="position-fixed bottom-0 start-0 end-0 text-light"
      style={{
        backgroundColor: "#100E1C",
        borderTop: "2px solid #DFA213",
        zIndex: 1050,
      }}
    >
      <div className="container py-3 d-flex flex-column flex-md-row align-items-md-center gap-3">
        <p className="mb-0 flex-grow-1 small">
          Vi sparar det som behövs i din webbläsare för att du ska kunna logga
          in och för att vi ska komma ihåg ditt val. Längre fram vill vi också
          använda cookies för statistik, men bara om du godkänner det.{" "}
          <Link to="/cookies" style={{ color: "#DFA213" }}>
            Läs mer
          </Link>
        </p>

       
        <div className="d-flex gap-2">
          <button
            type="button"
            className="cta-btn"
            style={{ flex: "1 1 0", whiteSpace: "nowrap" }}
            onClick={() => handleChoice(false)}
          >
            Endast nödvändiga
          </button>
          <button
            type="button"
            className="cta-btn"
            style={{ flex: "1 1 0", whiteSpace: "nowrap" }}
            onClick={() => handleChoice(true)}
          >
            Godkänn alla
          </button>
        </div>
      </div>
    </section>
  );
}
