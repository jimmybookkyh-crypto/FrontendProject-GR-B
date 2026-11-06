import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {
  getCookieConsent,
  saveCookieConsent,
  CONSENT_CHANGED_EVENT,
  COOKIE_POLICY_UPDATED,
} from "../utils/cookieConsent";
import "../styles/MyPage.css";
import "../styles/CookiesPage.css";

// Datum som "5 november 2026"
const formatSwedishDate = (date: string) =>
  new Date(date).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* Cookiesidan (P12 #416): förklarar vad som sparas och låter besökaren ändra sitt val.
   Samma stil som Mina sidor (klasserna i MyPage.css). */
export default function CookiesPage() {
  const [consent, setConsent] = useState(() => getCookieConsent());

  // Uppdatera om valet görs i bannern medan sidan är öppen
  useEffect(() => {
    const handleChange = () => setConsent(getCookieConsent());
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  const currentChoice = !consent
    ? "Du har inte gjort något val än. Statistik är avstängd tills du slår på den."
    : consent.statistics
      ? `Statistik är påslagen. Ditt val sparades ${formatSwedishDate(consent.date)}.`
      : `Statistik är avstängd. Ditt val sparades ${formatSwedishDate(consent.date)}.`;

  return (
    <div className="mypage">
      <Container className="py-4 py-lg-5">
        <header className="text-center mb-4 mb-lg-5">
          <h1 className="mypage-title">Cookies</h1>
          <p className="mypage-greeting mb-0">
            Här kan du läsa vad vi sparar i din webbläsare och varför.
            <br />
            Du bestämmer själv om du vill tillåta statistik.
          </p>
        </header>

        <Row className="justify-content-center">
          <Col xs={12} lg={8} className="d-flex flex-column gap-4">
            <section className="mypage-panel">
              <h2 className="mypage-panel-title">Om cookies</h2>
              <p className="mb-2">
                Cookies är små textfiler som en webbplats sparar i din
                webbläsare. Vi använder i stället webbläsarens egen lagring
                (localStorage), som fungerar på liknande sätt, och samma regler
                gäller för den.
              </p>
              <p className="mb-2">
                Enligt lagen får vi spara det som är nödvändigt för att sajten
                ska fungera. För allt annat, till exempel statistik, behöver vi
                ditt samtycke.
              </p>
              <p className="mb-0">
                Du kan när som helst ändra eller ta tillbaka ditt samtycke här
                på sidan.
              </p>
            </section>

            <section className="mypage-panel">
              <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                <h2 className="mypage-panel-title mb-0">
                  Nödvändigt <span className="mypage-count">(2)</span>
                </h2>
                <Form.Check
                  type="switch"
                  id="cookies-necessary"
                  className="cookies-switch mb-0"
                  checked
                  disabled
                  readOnly
                  aria-label="Nödvändigt är alltid påslaget"
                />
              </div>
              <p className="mb-2">
                Nödvändig lagring gör att sajtens grundläggande funktioner
                fungerar, till exempel att du kan logga in, boka biljetter och
                se dina bokningar på Mina sidor. Vi sparar två saker i din
                webbläsare: din inloggning och ditt val om cookies.
              </p>
              <p className="mypage-help mb-0">
                Utan det här fungerar inte sajten som den ska, och därför går
                det inte att stänga av.
              </p>
            </section>

            <section className="mypage-panel">
              <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                <h2 className="mypage-panel-title mb-0">
                  Statistik <span className="mypage-count">(0)</span>
                </h2>
                <Form.Check
                  type="switch"
                  id="cookies-statistics"
                  className="cookies-switch mb-0"
                  checked={consent?.statistics === true}
                  onChange={(e) => saveCookieConsent(e.target.checked)}
                  aria-label="Tillåt statistik"
                />
              </div>
              <p className="mb-2">
                Statistik hjälper oss att förstå hur besökare använder sajten,
                till exempel vilka sidor som besöks mest och var man fastnar i
                bokningen. Uppgifterna samlas in anonymt och används bara för
                att göra sajten bättre.
              </p>
              <p className="mypage-help mb-0">
                Vi använder ingen statistik i dag. Om vi börjar göra det sker
                det bara om du har slagit på den här.
              </p>
            </section>

            <section className="mypage-panel">
              <h2 className="mypage-panel-title">Trailers</h2>
              <p className="mb-0">
                Trailrarna visas via YouTube i ett läge som inte sparar cookies
                förrän du trycker på play. När du spelar en trailer kan YouTube
                spara cookies enligt sina egna regler.
              </p>
            </section>

            <section className="mypage-panel">
              <h2 className="mypage-panel-title">Ditt val</h2>
              <p className="mb-0" aria-live="polite">
                {currentChoice}
              </p>
            </section>

            <p className="cookies-updated text-center mb-0">
              Cookie-informationen uppdaterades senast{" "}
              {formatSwedishDate(COOKIE_POLICY_UPDATED)} av Filmvisarna AB.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

CookiesPage.route = {
  path: "/cookies",
  order: 16,
  label: "Cookies",
};
