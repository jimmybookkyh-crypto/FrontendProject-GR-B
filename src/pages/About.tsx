import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import entre from "../assets/filmvisarna-entre.jpg";
import "../styles/About.css";


const KONTAKT = {
  gata: "Exempelgatan 1",
  postadress: "123 45 Småstad",
  epost: "info@filmvisarna.example",
};

const OPPETTIDER = [
  { dagar: "Måndag–torsdag", tid: "10–21", veckodagar: [1, 2, 3, 4] },
  { dagar: "Fredag–lördag", tid: "10–23", veckodagar: [5, 6] },
  { dagar: "Söndag", tid: "14–21", veckodagar: [0] },
];


/* TODO: kolla punkterna, särskilt Salong 2 */
const SALONGER = [
  {
    id: "salong-1",
    namn: "Salong 1",
    platser: 88,
    punkter: ["Stor bioduk", "Laserprojektion", "Infinity Vision"],
  },
  {
    id: "salong-2",
    namn: "Salong 2",
    platser: 48,
    punkter: ["Mindre salong", "Intim och bekväm", "Modernt ljud"],
  },
];

/* TODO: exempelmeny och exempelpriser, byt till den riktiga menyn */
const SNACKS = [
  {
    kategori: "Popcorn",
    rader: [
      ["Liten", "39 kr"],
      ["Mellan", "49 kr"],
      ["Stor", "59 kr"],
    ],
  },
  {
    kategori: "Dryck",
    rader: [
      ["Läsk 33 cl", "29 kr"],
      ["Läsk 50 cl", "39 kr"],
      ["Vatten", "25 kr"],
    ],
  },
  {
    kategori: "Sött och salt",
    rader: [
      ["Pick & mix, 100 g", "22 kr"],
      ["Chips", "27 kr"],
      ["Nachos med ost", "49 kr"],
    ],
  },
];

const ikonProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IkonPlats() {
  return (
    <svg {...ikonProps}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IkonBrev() {
  return (
    <svg {...ikonProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IkonParkering() {
  return (
    <svg {...ikonProps}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function IkonCafe() {
  return (
    <svg {...ikonProps}>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 3v2M12 3v2" />
    </svg>
  );
}

function IkonRullstol() {
  return (
    <svg {...ikonProps}>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M12 8v6h4l2 5" />
      <path d="M8 11a5 5 0 1 0 6 7" />
    </svg>
  );
}

function Hero() {
  return (
    <div className="om-hero">
      <div className="om-hero-fond" aria-hidden="true">
        <img className="om-hero-bild" src={entre} alt="" />
      </div>
      <Container className="om-hero-text">
        <h1>Filmvisarna i Småstad</h1>
        <p>Två salonger. Massor av filmupplevelser.</p>
      </Container>
    </div>
  );
}

function Huvudkort() {
  return (
    <div className="om-kort">
      <section aria-labelledby="om-rubrik">
        <h2 id="om-rubrik" className="om-rubrik">Om biografen</h2>
        <p>
          Filmvisarna i Småstad är en modern biograf med industriell karaktär, varm inredning och
          avancerad filmteknik. Biografen har 2 salonger med totalt 136 platser och erbjuder flera
          olika bioupplevelser för dig som vill gå på bio i Småstad.
        </p>
        <p>
          Salong 1 har en av Sveriges största biodukar, laserprojektion och modernt ljud. Salongen
          är dessutom Infinity Vision-certifierad, en kvalitetsstämpel för en stor och omslutande
          bioupplevelse med imponerande bild och mäktigt ljud.
        </p>
        <p>
          Våra salonger har sin egen stil och tillsammans skapar de en personlig och bekväm
          bioupplevelse. På sitt invigningsår 2020 fick Biostaden utmärkelsen Boxoffice Blue Ribbon
          Cinema, som uppmärksammar biografer som erbjuder en särskilt enastående bioupplevelse.
        </p>
      </section>

      {/* TODO: exempel på faciliteter, ändra så att de stämmer */}
      <section className="om-delsektion" aria-labelledby="fac-rubrik">
        <h2 id="fac-rubrik" className="om-rubrik">Faciliteter</h2>
        <ul className="om-faciliteter">
          <li><IkonParkering /> Parkering nära</li>
          <li><IkonCafe /> Café &amp; Bar</li>
          <li><IkonRullstol /> Rullstolsanpassat</li>
        </ul>
      </section>

      <section id="salonger" className="om-delsektion om-anker" aria-labelledby="salonger-rubrik">
        <h2 id="salonger-rubrik" className="om-rubrik">Salonger</h2>
        <Row className="g-3">
          {SALONGER.map((salong) => (
            <Col sm={6} key={salong.id}>
              <article className="om-salong">
                <div className="om-salong-topp">
                  <h3>{salong.namn}</h3>
                  <span className="om-platser">{salong.platser} platser</span>
                </div>
                <ul className="om-punkter">
                  {salong.punkter.map((punkt) => (
                    <li key={punkt}>{punkt}</li>
                  ))}
                </ul>
              </article>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}

function Oppettider() {
  const idag = new Date().getDay();

  return (
    <section className="om-kort" aria-labelledby="tider-rubrik">
      <h2 id="tider-rubrik" className="om-rubrik">Öppettider</h2>
      <ul className="om-tider">
        {OPPETTIDER.map((rad) => {
          const arIdag = rad.veckodagar.includes(idag);
          return (
            <li key={rad.dagar} className={arIdag ? "idag" : undefined}>
              <span>
                {rad.dagar}
                {arIdag && <span className="visually-hidden"> (idag)</span>}
              </span>
              <span>{rad.tid}</span>
            </li>
          );
        })}
      </ul>
      <p className="om-not">Biografen öppnar 60 minuter före dagens första föreställning.</p>
    </section>
  );
}

function Lankar() {
  return (
    <section className="om-kort" aria-labelledby="lankar-rubrik">
      <h2 id="lankar-rubrik" className="om-rubrik">Länkar</h2>
      <ul className="om-lankar">
        <li>
          <Link to="/moviecatalog">Se vad som visas just nu</Link>
        </li>
      </ul>
    </section>
  );
}

function HittaTillOss() {
  const adress = `${KONTAKT.gata}, ${KONTAKT.postadress}`;
  const karta = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adress)}`;

  return (
    <section id="hitta-till-oss" className="om-kort om-hitta om-anker" aria-labelledby="hitta-rubrik">
      <img className="om-hitta-bild" src={entre} alt="Biografens entré en vinterkväll, med upplyst FV-skylt" />
      <div className="om-hitta-info">
        <h2 id="hitta-rubrik">Hitta hit</h2>
        <ul className="om-kontakt">
          <li>
            <IkonPlats />
            <span>{adress}</span>
          </li>
          <li>
            <IkonBrev />
            <a href={`mailto:${KONTAKT.epost}`}>{KONTAKT.epost}</a>
          </li>
        </ul>
        <a className="btn btn-danger om-knapp" href={karta} target="_blank" rel="noopener noreferrer">
          Vägbeskrivning
        </a>
      </div>
    </section>
  );
}

function SnacksMeny() {
  return (
    <section id="snacks-meny" className="om-sektion om-anker" aria-labelledby="snacks-rubrik">
      <div className="om-kort">
        <h2 id="snacks-rubrik" className="om-rubrik">Snacks meny</h2>
        <Row className="g-4">
          {SNACKS.map((grupp) => (
            <Col md={4} key={grupp.kategori}>
              <div className="om-meny-grupp">
                <h3>{grupp.kategori}</h3>
                <dl>
                  {grupp.rader.map(([namn, pris]) => (
                    <div className="om-meny-rad" key={namn}>
                      <dt>{namn}</dt>
                      <dd>{pris}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}

export default function About() {
  const { hash, key } = useLocation();

  /* Scrollar till rätt avsnitt när headern länkar hit med #hitta-till-oss, #salonger eller #snacks-meny */
  useEffect(() => {
    if (!hash) return;
    const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ behavior: minskadRorelse ? "auto" : "smooth", block: "start" });
  }, [hash, key]);

  return (
    <div className="om-sida">
      <Hero />
      <Container className="om-innehall">
        <Row className="g-3 g-lg-4">
          <Col lg={8}>
            <Huvudkort />
          </Col>
          <Col lg={4}>
            <div className="om-sidokolumn">
              <Oppettider />
              <Lankar />
              <HittaTillOss />
            </div>
          </Col>
        </Row>
        <SnacksMeny />
      </Container>
    </div>
  );
}

About.route = {
  path: "/about",
  order: 2,
  label: "Om oss",
};
