import { useEffect } from "react";
import { useLocation } from "react-router";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import entranceImage from "../assets/filmvisarna-entre.webp";
import "../styles/buttons.css";
import "../styles/About.css";
import { routes } from "../utils/paths.ts";
import BgImage from "../components/BgImgBd.tsx";
  


const CONTACT = {
  gata: "Exempelgatan 1",
  postadress: "123 45 Småstad",
  epost: "info@filmvisarna.bio",
};

const OPENING_HOURS = [
  { dagar: "Måndag–torsdag", tid: "10–21" },
  { dagar: "Fredag–lördag", tid: "10–23" },
  { dagar: "Söndag", tid: "14–21" },
];

/* TODO: kolla punkterna, särskilt Salong 2 */
const AUDITORIUMS = [
  {
    id: "salong-1",
    namn: "Salong 1 – Stora salongen",
    platser: 81,
    punkter: ["Stor bioduk", "Laserprojektion", "Infinity Vision"],
  },
  {
    id: "salong-2",
    namn: "Salong 2 – Lilla salongen",
    platser: 55,
    punkter: ["Mindre salong", "Intim och bekväm", "Modernt ljud"],
  },
];

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

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function LocationIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function ParkingIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function CafeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 3v2M12 3v2" />
    </svg>
  );
}

function WheelchairIcon() {
  return (
    <svg {...iconProps}>
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
        <img className="om-hero-bild" src={entranceImage} alt="" />
      </div>
      <Container className="om-hero-text">
        <h1>Filmvisarna i Småstad</h1>
        <p>Två salonger. Massor av filmupplevelser.</p>
      </Container>
    </div>
  );
}

function MainCard() {
  return (
    <div className="om-kort">
      <section aria-labelledby="om-rubrik">
        <h2 id="om-rubrik" className="om-rubrik">
          Om biografen
        </h2>
        <p>
          Filmvisarna i Småstad är en modern biograf med industriell karaktär,
          varm inredning och avancerad filmteknik. Biografen har två salonger med
          totalt 136 platser och erbjuder flera olika bioupplevelser för dig som
          vill gå på bio i Småstad.
        </p>
        <p>
          Salong 1 har en av Sveriges största biodukar, laserprojektion och
          modernt ljud. Salongen är dessutom Infinity Vision-certifierad, en
          kvalitetsstämpel för en stor och omslutande bioupplevelse med
          imponerande bild och mäktigt ljud.
        </p>
        <p>
          Salong 2 är vår mindre salong, med en intim och bekväm känsla och
          modernt ljud. Här sitter du nära filmen, perfekt för dig som vill se
          en film i lugn och ro tillsammans med färre människor.
        </p>
        <p>
          Våra salonger har sin egen stil och tillsammans skapar de en personlig
          och bekväm bioupplevelse. På sitt invigningsår 2020 fick Filmvisarna
          utmärkelsen Boxoffice Blue Ribbon Cinema, som uppmärksammar biografer
          som erbjuder en särskilt enastående bioupplevelse.
        </p>
      </section>

      <section className="om-delsektion" aria-labelledby="fac-rubrik">
        <h2 id="fac-rubrik" className="om-rubrik">
          Faciliteter
        </h2>
        <ul className="om-faciliteter">
          <li>
            <ParkingIcon /> Parkering nära
          </li>
          <li>
            <CafeIcon /> Café &amp; bar
          </li>
          <li>
            <WheelchairIcon /> Rullstolsanpassat
          </li>
        </ul>
      </section>

      <section
        id="salonger"
        className="om-delsektion"
        aria-labelledby="salonger-rubrik"
      >
        <h2 id="salonger-rubrik" className="om-rubrik">
          Salonger
        </h2>
        <Row className="g-3">
          {AUDITORIUMS.map((auditorium) => (
            <Col sm={6} key={auditorium.id}>
              <article className="om-salong">
                <div className="om-salong-topp">
                  <h3>{auditorium.namn}</h3>
                  <span className="om-platser">{auditorium.platser} platser</span>
                </div>
                <ul className="om-punkter">
                  {auditorium.punkter.map((feature) => (
                    <li key={feature}>{feature}</li>
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

function OpeningHours() {
  return (
    <section className="om-kort" aria-labelledby="tider-rubrik">
      <h2 id="tider-rubrik" className="om-rubrik">Öppettider</h2>
      <ul className="om-tider">
        {OPENING_HOURS.map((entry) => (
          <li key={entry.dagar}>
            <span>{entry.dagar}</span>
            <span>{entry.tid}</span>
          </li>
        ))}
      </ul>
      <p className="om-not">Biografen öppnar 60 minuter före dagens första föreställning.</p>
    </section>
  );
}

function FindUs() {
  const address = `${CONTACT.gata}, ${CONTACT.postadress}`;
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section
      id="hitta-till-oss"
      className="om-kort om-hitta"
      aria-labelledby="hitta-rubrik"
    >
      <img
        className="om-hitta-bild"
        src={entranceImage}
        alt="Biografens entré en vinterkväll, med upplyst FV-skylt"
        loading="lazy"
      />
      <div className="om-hitta-info">
        <h2 id="hitta-rubrik">Hitta hit</h2>
        <ul className="om-kontakt">
          <li>
            <LocationIcon />
            <span>{address}</span>
          </li>
          <li>
            <MailIcon />
            <a href={`mailto:${CONTACT.epost}`}>{CONTACT.epost}</a>
          </li>
        </ul>
        <a
          className="cta-btn om-knapp rounded-pill py-2 px-4 fw-bold d-inline-block text-decoration-none align-self-start"
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Vägbeskrivning
        </a>
      </div>
    </section>
  );
}

function SnacksMenu() {
  return (
    <section id="snacks-meny" className="om-sektion" aria-labelledby="snacks-rubrik">
      <div className="om-kort">
        <h2 id="snacks-rubrik" className="om-rubrik">Snacksmeny</h2>
        <Row className="g-4">
          {SNACKS.map((group) => (
            <Col md={4} key={group.kategori}>
              <div className="om-meny-grupp">
                <h3>{group.kategori}</h3>
                <dl>
                  {group.rader.map(([name, price]) => (
                    <div className="om-meny-rad" key={name}>
                      <dt>{name}</dt>
                      <dd>{price}</dd>
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

const SCROLL_POSITION: Record<string, ScrollLogicalPosition> = {
  salonger: "end",
  "hitta-till-oss": "center",
  "snacks-meny": "start",
};

export default function About() {
  const { hash, key } = useLocation();

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const id = hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ behavior, block: SCROLL_POSITION[id] ?? "start" });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [hash, key]);

  return (
    <BgImage>
    <div
      className="om-sida page-container"
    >
      <Hero />
      <Container className="om-innehall">
        <Row className="g-3 g-lg-4">
          <Col lg={8}>
            <MainCard />
          </Col>
          <Col lg={4}>
            <div className="om-sidokolumn">
              <OpeningHours />
              <FindUs />
            </div>
          </Col>
        </Row>
        <SnacksMenu />
      </Container>
    </div>
      </BgImage>
  );
}

About.route = {
  path: routes.about,
  order: 2,
  label: "Om oss",
};
