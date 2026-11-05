import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";
import "../styles/MyPage.css";

const TERMS_UPDATED = "5 november 2026";


const CONTACT = {
  company: "Filmvisarna AB",
  street: "Exempelgatan 1",
  postalAddress: "123 45 Småstad",
  email: "info@filmvisarna.bio",
};


export default function TermsPage() {
  return (
    <div className="mypage">
      <Container className="py-4 py-lg-5">
        <header className="text-center mb-4 mb-lg-5">
          <h1 className="mypage-title">Villkor & policies</h1>
          <p className="mypage-greeting mb-0">
            Här hittar du det som gäller när du bokar biljetter hos oss
            <br />
            och hur vi tar hand om dina uppgifter.
          </p>
        </header>

        <Row className="justify-content-center">
          <Col xs={12} lg={8} className="d-flex flex-column gap-4">
            <section className="mypage-panel" aria-labelledby="villkor-kop">
              <h2 id="villkor-kop" className="mypage-panel-title">
                Köpvillkor för biobiljetter
              </h2>
              <p className="mb-2">
                Du bokar dina biljetter här på sajten. Du väljer visning, antal
                biljetter och platser i salongen. När bokningen är klar får du
                ett bokningsnummer på skärmen, och vi skickar en bekräftelse
                till din e-post.
              </p>
              <p className="mb-2">
                Du betalar i kassan när du kommer till biografen. Uppge ditt
                bokningsnummer, så hittar personalen din bokning.
              </p>
              <p className="mb-1">Priser per biljett:</p>
              <ul className="mb-2">
                <li>Vuxen: 140 kr</li>
                <li>Pensionär: 120 kr</li>
                <li>Barn under 12 år: 80 kr</li>
              </ul>
              <p className="mb-0">
                Du kan avboka fram till 2 timmar före visningen. Är du medlem
                avbokar du under Mina sidor. Har du bokat som gäst använder du
                länken i bekräftelsemejlet. Därefter går bokningen inte att
                avboka.
              </p>
            </section>

            <section className="mypage-panel" aria-labelledby="villkor-alder">
              <h2 id="villkor-alder" className="mypage-panel-title">
                Åldersgränser
              </h2>
              <p className="mb-2">
                Varje film har en åldersgräns: barntillåten (Btl), 7, 11 eller
                15 år. Du ser den på filmkortet och på filmens sida.
              </p>
              <ul className="mb-2">
                <li>
                  Barn under 7 år får se filmer med 7-årsgräns i sällskap med
                  en vuxen.
                </li>
                <li>
                  Barn som har fyllt 7 år får se filmer med 11-årsgräns i
                  sällskap med en vuxen.
                </li>
                <li>Filmer med 15-årsgräns har inga undantag.</li>
              </ul>
              <p className="mypage-help mb-0">
                Personalen kan be om legitimation. Kolla åldersgränsen innan du
                bokar, så att ingen blir utan film.
              </p>
            </section>

            <section className="mypage-panel" aria-labelledby="villkor-data">
              <h2 id="villkor-data" className="mypage-panel-title">
                Dina personuppgifter
              </h2>
              <p className="mb-1">Det här sparar vi:</p>
              <ul className="mb-2">
                <li>
                  Om du är medlem: användarnamn, e-postadress och lösenord.
                  Lösenordet sparas krypterat, så att ingen kan läsa det.
                </li>
                <li>
                  När du bokar: e-postadress, visning, platser och biljettyper.
                </li>
              </ul>
              <p className="mb-2">
                Vi använder uppgifterna för att genomföra din bokning, skicka
                bekräftelsen och visa dina bokningar på Mina sidor. Vi säljer
                inte dina uppgifter och lämnar inte ut dem till någon annan.
              </p>
              <p className="mb-2">
                Uppgifterna sparas så länge du har ett konto. Raderar du kontot
                tar vi bort dina personuppgifter. Tidigare bokningar sparas
                utan uppgifter om vem som bokade.
              </p>
              <p className="mb-0">
                Du kan ändra dina uppgifter och radera ditt konto under Mina
                sidor. Vill du veta vilka uppgifter vi har om dig kan du
                kontakta oss.
              </p>
            </section>

            <section className="mypage-panel" aria-labelledby="villkor-cookies">
              <h2 id="villkor-cookies" className="mypage-panel-title">
                Cookies
              </h2>
              <p className="mb-0">
                Vi sparar bara det som behövs för att sajten ska fungera, och
                statistik bara om du har godkänt det. Läs mer och ändra ditt
                val på sidan <Link to="/cookies">Cookies</Link>.
              </p>
            </section>

            <section className="mypage-panel" aria-labelledby="villkor-tillganglighet">
              <h2 id="villkor-tillganglighet" className="mypage-panel-title">
                Tillgänglighet
              </h2>
              <p className="mb-0">
                Vi vill att alla ska kunna boka biljetter hos oss. Sajten ska
                gå att använda med tangentbord och skärmläsare och vara lätt
                att läsa på både mobil och dator. Om något inte fungerar för
                dig vill vi gärna veta det.
              </p>
            </section>

            <section className="mypage-panel" aria-labelledby="villkor-kontakt">
              <h2 id="villkor-kontakt" className="mypage-panel-title">
                Kontakt
              </h2>
              <p className="mb-0">
                {CONTACT.company}
                <br />
                {CONTACT.street}, {CONTACT.postalAddress}
                <br />
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </p>
            </section>

            <p className="mypage-help text-center mb-0">
              Villkoren uppdaterades senast {TERMS_UPDATED} av {CONTACT.company}.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

TermsPage.route = {
  path: "/villkor",
  order: 17,
  label: "Villkor & policies",
};
