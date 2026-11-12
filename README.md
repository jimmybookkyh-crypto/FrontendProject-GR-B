**GitHub-repo:** [jimmybookkyh-crypto/FrontendProject-GR-B](https://github.com/jimmybookkyh-crypto/FrontendProject-GR-B)

# Filmvisarna 

En bokningssajt för biografen Filmvisarna i Småstad
Som besökare kan man se vilka filmer som går just nu samt titta på filmernas trailers, välja vilken visning och platser i salongskartan och boka biljetter både som medlem eller som gäst.
De får ett unikt bokningsnummer och en bekräftelse via e-post

Grupprojekt i kursen Frontend-projekt (FE25, KYH), 14 september–20 november 2026.

---

## Funktioner

### För besökare
- Startsida med herosektion som visar månadens event och trailers 
- Filmkatalog med filter på datum Idag / Imorgon / Kalender och åldersgräns
- Filmdetaljsida med poster, trailer, beskrivning, skådespelare, regissör och kommande visningar
- Eventsida med kommande temaveckor
- Bokning:
  - grafisk salongskarta där bokade platser är markerade och de bästa lediga platserna är framhävda
  - platserna uppdateras live när någon annan bokar , med WebSockets
  - biljetter som Vuxen (140 kr), Pensionär (120 kr) eller Barn (80 kr), med totalpris direkt
- Bekräftelsesida med film, datum, tid, rad, stolsnummer och ett svårgissat bokningsnummer (UUID)
- Bekräftelsemejl till både gäster och inloggade
- Avbokning fram till 2 timmar före visningen
  - gäster avbokar via länken i bekräftelsemejlet
  - medlemmar avbokar på Mina sidor
- Information om cookies och val av statistikcookies

### För inloggade användare
- Skapa konto och logga in
- Mina sidor: kommande bokningar och bokningshistorik, avbokning, uppdatering av profil
- Man kan inte radera sitt konto om man har kommande bokningar, tidigare bokningar anonymiseras när kontot raderas.

### För admin
- Adminportal: sök bokning på bokningsnummer och se alla detaljer
- Hantera filmer, visningar, biljettpriser och användarkonton

---

## Teknik

| Del | Teknik |
| --- | --- |
| Frontend | React 19, TypeScript, React Router, React Bootstrap / Bootstrap 5, Vite |
| Backend | Node.js, Express 5, TypeScript (körs med `tsx`) |
| Databas | PostgreSQL hostad på Supabase, `pg` |
| Inloggning | `jsonwebtoken`, `bcryptjs` |
| Realtid | `ws` (WebSocket) |
| Mejl | Nodemailer (SMTP) |
| Linting | Oxlint |

## Kom igång

### Krav

- Node.js 20 eller senare
- En PostgreSQL-databas tex Supabase

### Installation

```bash
git clone https://github.com/jimmybookkyh-crypto/FrontendProject-GR-B.git
cd FrontendProject-GR-B
npm install
```

### Miljövariabler

Kopiera `.env.example` till `.env` i projektets rot och fyll i värdena:

| Variabel | Beskrivning |
| --- | --- |
| `PORT` | Port för backend `3000` |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Anslutning till databasen |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Hemlig nyckel för att signera inloggningstoken, och hur länge en token gäller |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Utskick av bekräftelsemejl vid tomma skickas inga mejl, men bokningen fungerar ändå. |
| `APP_URL` | Sajtens adress, används för länkar i mejlet (tomt = `http://localhost:5173`) |

`.env` checkas aldrig in i git.

### Databas

Skapa tabellerna och vyerna genom att köra SQL-filerna i databasen tex i Supabase SQL Editor

1. [backend/db/schema.sql](backend/db/schema.sql) – tabeller
2. [backend/db/views.sql](backend/db/views.sql) – vyer

ER-diagram finns i [docs/er-diagram.drawio.png](docs/er-diagram.drawio.png).

### Starta projektet

```bash
npm start
```

Startar både backend (`http://localhost:3000`) och frontend (`http://localhost:5173`)

## Skript

| Kommando | Beskrivning |
| --- | --- |
| `npm start` | Startar backend och frontend samtidigt |
| `npm run dev` | Startar bara frontend |
| `npm run backend` | Startar bara backend |
| `npm run build` | Typkontrollerar och bygger frontend |
| `npm run preview` | Visar den byggda versionen lokalt (kör `npm run build` först) |
| `npm run lint` | Kör Oxlint |

## Projektstruktur

```
├── backend/
│   ├── db/          # Databasanslutning, schema.sql och views.sql
│   ├── interface/   # Typer för backend
│   ├── routes/      # Express-routes
│   ├── services/    # Affärslogik, tex skapa bokning och skicka mejl
│   ├── utils/       # Validering, JWT, auth-middleware mm
│   ├── server.ts    # Startar Express och WebSocket-servern
│   └── websocket.ts # Platsuppdateringar
├── frontend/
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── components/  # Återanvändbara komponenter 
│       ├── hooks/       # Egna hooks
│       ├── pages/       # Sidor 
│       ├── Partials/    # Header och Footer
│       ├── styles/      # CSS
│       └── utils/       # API-anrop, auth, hjälpfunktioner
├── docs/            # ER-diagram
└── vite.config.ts
```

```

```

## Sidor

| Sökväg | Sida |
| --- | --- |
| `/` | Startsida |
| `/moviecatalog` | Filmkatalog |
| `/movies/:id` | Filmdetaljer |
| `/booking/:showingId` | Bokning av en föreställning |
| `/bookingconfirmation` | Bokningsbekräftelse |
| `/event` | Event |
| `/login` | Logga in |
| `/bli-medlem` | Bli medlem |
| `/mypage` | Mina sidor |
| `/admin` | Admin |
| `/about` | Om oss |
| `/cookies` | Cookies |
| `/villkor` | Villkor |

## API

Alla endpoints nås via `/api` från frontend. 🔒 = kräver inloggning, 👑 = kräver admin.

| Resurs | Endpoints |
| --- | --- |
| `/movies` | `GET /`, `GET /current`, `GET /not-current`, `GET /age-rating/:ageRating`, `GET /age-rating/:ageRating/current`, `GET /:id`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id` |
| `/showings` | `GET /`, `GET /:id`, `GET /:id/seats`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id` |
| `/bookings` | `POST /`, 🔒 `GET /me`, `GET /confirmation/:bookingNumber`, `GET /token/:token`, `PATCH /token/:token/cancel`, 🔒 `GET /:id`, 🔒 `PATCH /:id/cancel`, 👑 `GET /`, 👑 `PATCH /:id` |
| `/users` | `POST /auth/register`, `POST /auth/login`, 🔒 `GET /:id`, 🔒 `PATCH /:id`, 🔒 `DELETE /:id`, 👑 `GET /` |
| `/events` | `GET /`, `GET /:id`, `GET /:id/showings`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id` |
| `/auditorium` | `GET /`, `GET /:id` |
| `/seats` | `GET /` |
| `/tickets` | `GET /ticketTypes` |


## Arbetssätt

- Scrum med 5 sprintar (UX → Backend → MVP → Färdig produkt → Buggfix), en ny Scrum-master varje sprint
- Kanban-board i GitHub Projects, storleksbedömning med planning poker
- Daily standup, parprogrammering och retrospektiv efter varje sprint
- Stabilbranch `main`
- Utvecklingsbranch `dev-main`
- Varje uppgift har gjorts i en egen branch som namnges efter issue-numret, t.ex. `560-p24-readme`.
- Ändringar slås ihop till `dev-main` via pull requests.
- Pull requests till `dev-main` kräver två godkännanden

## Gruppmedlemmar

- William Engman - WilliamEngman24
- Tommy Hulten - Tomhul
- Angelica Jonsson Landström - AngelicaJL97
- Eva Maria Köning - MrsKoning
- Jimmy Book - jimmybookkyh-crypto
- Robin Karlsson - Fluuffyyy


## Förbättringsförslag

- Betalning online och att ohämtade biljetter släpps 2 timmar före visningen
- Bokningsflödet, tydligare steg där biljettdelen "öppnas" först när platserna är valda
- Trailern på filmdetaljsidan som affisch med egen play-knapp, så att YouTube laddas först vid klick
- Posters i Supabase Storage i stället för i frontend
- Sökfunktion för filmer
- Priser per visning tex premiärpris
- Statistikcookies kopplade till en riktig analystjänst

---

## Inloggning för bedömning

Inloggningsuppgifterna till admin lämnas in separat i Omniway.

Ctrl shift v
