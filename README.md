**GitHub-repo:** [jimmybookkyh-crypto/FrontendProject-GR-B](https://github.com/jimmybookkyh-crypto/FrontendProject-GR-B)

# Filmvisarna
Grupprojekt i kursen Frontend-projekt (FE25, KYH), 14 september–20 november 2026.
En fiktiv bokningssajt för biografen Filmvisarna i Småstad
Som besökare kan man se vilka filmer som går just nu samt titta på filmernas trailers, välja en visning och platser i salongskartan och boka biljetter både som medlem eller som gäst.
Alla bokningar får ett unikt bokningsnummer och en bekräftelse via e-post. Gäst kan avboka via länk i e-post medan medlemmen samlar alla sina bokningar och möjlighet att avboka i Mina sidor.
---
## Funktioner

### För besökare

- Startsida med herosektion som visar månadens event, några av filmerna för pågående event med filmens poster och trailer
- Filmer på startsidan med filter på datum Idag / Imorgon / Kalender och filterknapp: åldersgräns
- Filmdetaljsida med poster, trailer, beskrivning, skådespelare, regissör och datum när filmen visas på biografen.
- Eventsida med kommande temaveckor – tre event visas, nya event fylls på per automatik. 
- Bokning:
  - grafisk salongskarta där redan bokade platser är markerade och platserna för bästa upplevelse är high-lightade.
  - platserna uppdateras live när någon annan bokar, med WebSockets
  - biljetter som Vuxen (140 kr), Pensionär (120 kr) eller Barn (80 kr), med totalpris direkt
- Bekräftelsesida med film, datum, tid, rad, stolsnummer och ett svårgissat bokningsnummer (UUID), avbokningsregler.
- Bekräftelsemejl till både gäster och inloggade
- Avbokning fram till 2 timmar före visningen
  - gäster avbokar via länken i bekräftelsemejlet
  - medlemmar avbokar på Mina sidor
- Information om cookies och val av statistikcookies
- Villkor och policy där man bland annat kan läsa mer om åldersregler.
- Om oss sida där man kan läsa om biogrfen, faciliteter, salonger, öppettider, snacks-meny, kontaktuppgifter och hur man hittar tll biografen.
- Filmkatalog där man ser filmerna som visas nu och kommande filmer. Här ifrån kan man även välja en film och se när den går på biografen.

### För inloggade användare

- Skapa konto och logga in
- Mina sidor: kommande bokningar och bokningshistorik, avbokning, uppdatering av profil
- Man kan inte radera sitt konto om man har kommande bokningar. Tidigare bokningar anonymiseras när kontot raderas.

### För admin

- Adminportal: söka bokning på bokningsnummer, se alla detaljer och avboka.
---

## Teknik

| Del        | Teknik                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| Frontend   | React 19, React DOM, TypeScript, React Router, React Bootstrap / Bootstrap 5, Vite |
| Backend    | Node.js, Express 5, TypeScript (körs med `tsx`), `dotenv`                          |
| Databas    | PostgreSQL hostad på Supabase, `pg`                                                |
| Inloggning | `jsonwebtoken`, `bcryptjs`                                                         |
| Realtid    | `ws` (WebSocket)                                                                   |
| E-post     | Nodemailer (SMTP)                                                                  |
| Bilder     | Sharp (skalar bilderna när sajten byggs)                                           |
| Linting    | Oxlint                                                                             |
| Drift      | Egen server med Ubuntu, PM2 håller backend igång                                   |

### Varför vi valde den här tekniken

- **Bootstrap med React Bootstrap:** Vi byggde den klickbara prototypen direkt i Bootstrap i stället för i Figma. Då kunde vi återanvända layout och komponenter från prototypen när React-appen byggdes. Bootstrap ger också färdiga responsiva komponenter, som rutnät, menyer, formulär och modaler.
- **React, Vite och React Router:** React var ett krav i kursen. Vite ger snabb utvecklingsserver och snabbt bygge. React Router ger varje sida en egen adress som går att bokmärka och dela.
- **TypeScript i både frontend och backend:** Med samma språk och typer i hela projektet hittade vi fel redan när vi skrev koden och inte först när sajten kördes. Det gjorde det också lättare att jobba i varandras kod.
- **Node.js och Express:** Det var kursens ramverk för backend. Express gör det enkelt att bygga ett REST-API med en route per resurs.
- **PostgreSQL på Supabase:** Vi ville lära oss en ny databas. En relationsdatabas passar bokningsdata med många kopplingar mellan film, visning, salong, stol och biljett. Ett unikt index stoppar dubbelbokning redan i databasen. Supabase gav oss en gemensam databas i molnet som alla i gruppen kunde nå.
- **JWT och bcryptjs:** Inloggningen kräver ingen sessionslagring på servern. Lösenord sparas bara som hash.
- **WebSocket (`ws`):** Stolskartan uppdateras direkt när någon annan bokar, utan att sidan behöver laddas om.
- **UUID som bokningsnummer:** Bokningsnumret är unikt och svårt att gissa och följer produktägarens krav.
- **Sharp:** Skapar flera storlekar av varje originalbild i WebP-format. Webbläsaren väljer sedan själv rätt storlek för skärmen med `srcset`, så att mobilen inte behöver ladda ner stora bilder och sidorna laddas snabbare.
- **Ubuntu och PM2:** Sajten ligger live på en egen server. Hur sajten uppdateras beskrivs i [DRIFT.md](DRIFT.md).

## Kom igång

### Krav

- Node.js 20.11 eller senare
- En PostgreSQL-databas tex Supabase

### Installation

```bash
git clone https://github.com/jimmybookkyh-crypto/FrontendProject-GR-B.git
cd FrontendProject-GR-B
npm install
```

### Miljövariabler

Kopiera `.env.example` till `.env` i projektets rot och fyll i värdena:

| Variabel                                                                                    | Beskrivning                                                                       |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------|
| `PORT`                                                                                      | Port för backend       `3000`                                                      |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Anslutning til databasen       `JWT_SECRET`, `JWT_EXPIRES_IN`                                                                              | Hemlig nyckel för att signera inloggningstoken, och hur länge en token gäller   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`                               | Utskick av bekräftelse via epost vid tomma skickas inga e-post, men bokningen fungerar ändå. |
| `APP_URL`                                                                                 | Sajtens adress, används för länkar i mejlet (tomt = `http://localhost:5173`)         |
`.env` checkas aldrig in i git.

### Databas

Skapa tabellerna och vyerna genom att köra SQL-filerna i databasen tex i Supabase SQL Editor

1. [backend/db/schema.sql](backend/db/schema.sql) – tabeller
2. [backend/db/views.sql](backend/db/views.sql) – vyer

ER-diagram finns i [docs/er-diagram.drawio.png](docs/er-diagram.drawio.png).

Bilderna anges med bildnamn, inte URL: `movies.images` = `["thor-love-and-thunder"]` och `events.image` = `batman`. [backend/db/local-images.sql](backend/db/local-images.sql) sätter bildnamnen för befintliga filmer och event.

### Starta projektet

```bash
npm start
```

### Startordning för backend och frontend

Vid uppstart med `npm start` används `concurrently` för att starta backend och frontend.
Frontend använder `wait-on` för att vänta tills backends port 3000 är tillgänglig innan Vite startas.
Detta förhindrar att frontend gör API-anrop innan backend har startat och minskar risken för misslyckade API-anrop vid första uppstarten.

## Skript

| Kommando               | Beskrivning                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm start`            | Startar backend och frontend samtidigt                                                                        |
| `npm run dev`          | Startar bara frontend                                                                                         |
| `npm run backend`      | Startar bara backend                                                                                          |
| `npm run build`        | Skapar bilderna, typkontrollerar och bygger frontend                                                          |
| `npm run scale-images` | Skapar WebP-bilder i olika storlekar från `source-images/` (hoppar över befintliga, `--force` skapar om alla) |
| `npm run preview`      | Visar den byggda versionen lokalt (kör `npm run build` först)                                                 |
| `npm run lint`         | Kör Oxlint                                                                                                    |
| `npm run serve`        | Startar endast backend-servern som serverar den byggda applikationen. Används i produktionsmiljön.            |

Hur sajten driftsätts och uppdateras på servern beskrivs i [DRIFT.md](DRIFT.md).

## Projektstruktur

```
├── backend/
│   ├── db/              # Databasanslutning (pool.ts), schema.sql, views.sql och local-images.sql
│   ├── interface/       # Typer för backend
│   ├── routes/          # Express-routes, en fil per resurs
│   ├── scripts/         # Lägger till visningar och eventperioder i databasen
│   ├── services/        # Affärslogik, tex skapa bokning och skicka mejl
│   ├── utils/           # Validering, JWT, auth-middleware, schemaläggning mm
│   ├── scheduler.ts     # Kör skripten i scripts/ vid start och var tionde minut
│   ├── server.ts        # Startar Express, WebSocket-servern och schemaläggaren
│   └── websocket.ts     # Platsuppdateringar i realtid
├── docs/                # ER-diagram
├── frontend/
│   ├── dist/            # Byggd frontend, skapas av npm run build, finns inte i git
│   ├── public/
│   │   ├── robots.txt
│   │   └── images/      # Skapas av npm run scale-images, finns inte i git
│   ├── src/
│   │   ├── assets/      # Logga och bilder som används i koden
│   │   ├── components/  # Återanvändbara komponenter
│   │   ├── hooks/       # Egna hooks
│   │   ├── interface/   # Typer för frontend
│   │   ├── pages/       # Sidor
│   │   ├── Partials/    # Header och Footer
│   │   ├── styles/      # CSS
│   │   ├── utils/       # API-anrop, auth, hjälpfunktioner
│   │   ├── App.tsx      # Grundlayout med Header, sidinnehåll och Footer
│   │   ├── main.tsx     # Startpunkt för React
│   │   └── routes.tsx   # Alla routes
│   └── index.html
├── scripts/
│   └── resize-images.js # Skalar bilderna med Sharp
├── source-images/       # Originalbilder: movies/ och events/
├── .env                 # Hemligheter, finns inte i git
├── .env.example         # Mall för .env
├── .gitignore
├── .oxlintrc.json       # Inställningar för Oxlint
├── DRIFT.md             # Driftsättning på servern
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json        # TypeScript-inställningar, pekar på app och node
├── tsconfig.app.json    # TypeScript för frontend
├── tsconfig.node.json   # TypeScript för vite.config.ts
└── vite.config.ts       # Vite, med proxy för /api till backend
```

## Sidor

| Sökväg                | Sida                          | Fil                       | Åtkomst                   |
| --------------------- | ----------------------------- | ------------------------- | ------------------------- |
| `/`                   | Startsida                     | `Start.tsx`               | Alla                      |
| `/filmer`             | Filmkatalog                   | `MoviesCatalog.tsx`       | Alla                      |
| `/filmer/:id`         | Filmdetaljer                  | `MoviesDetails.tsx`       | Alla                      |
| `/bokning/:showingId` | Bokning av en föreställning   | `Booking.tsx`             | Alla (gäst eller inloggad)|
| `/bekraftelse`        | Bokningsbekräftelse/avbokning | `BookingConfirmation.tsx` | Alla                      |
| `/event`              | Event                         | `EventPage.tsx`           | Alla                      |
| `/logga-in`           | Logga in                      | `Login.tsx`               | Alla                      |
| `/bli-medlem`         | Bli medlem                    | `Register.tsx`            | Alla                      |
| `/mina-sidor`         | Mina sidor                    | `MyPage.tsx`              | 🔒 Inloggad              |
| `/admin`              | Admin                         | `AdminPage.tsx`           | 👑 Admin                 |
| `/om-oss`             | Om oss                        | `About.tsx`               | Alla                      |
| `/cookies`            | Cookies                       | `CookiesPage.tsx`         | Alla                      |
| `/villkor`            | Villkor & policies            | `TermsPage.tsx`           | Alla                      |
| `*`                   | Sidan finns inte (404)        | `NotFound.tsx`            | Alla                      |

Alla sidor ligger i `frontend/src/pages/`. Varje sida har en egen `route` med sökväg och ordning, och `frontend/src/routes.tsx` hämtar in alla sidor automatiskt. En ny sida i mappen får alltså en route utan att den behöver läggas till för hand.

Alla adresser finns samlade i `frontend/src/utils/paths.ts`.

- Gamla adresser (`/login`, `/mypage`, `/bookingconfirmation`) skickas vidare till de nya, så att länkar i tidigare bekräftelsemejl fungerar.
- Den som inte är inloggad och går till Mina sidor skickas till inloggningen och kommer tillbaka till Mina sidor efteråt.
- Adminsidan kräver ett konto med rollen admin.
- Gäster öppnar sin bokning via länken i bekräftelsemejlet (`/bekraftelse?token=…`) och kan avboka den där.

## Bilder

Affischer och eventbilder ligger i projektet som WebP i flera storlekar, inte hos externa sajter. Webbläsaren väljer själv rätt storlek med `srcset`.

| Del                             | Var                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Originalbilder (committas)      | `source-images/movies/` och `source-images/events/`                            |
| Skalningsskript (Sharp)         | `scripts/resize-images.js`                                                     |
| Skalade bilder (committas inte) | `frontend/public/images/<movies\|events>/<bildnamn>/<bredd>.webp`              |
| Storlekar                       | Affischer 200, 400 och 800 px (beskurna till 2:3), eventbilder 600 och 1200 px |
| Hjälpfunktioner i frontend      | `frontend/src/utils/images.ts` (`moviePoster`, `eventImage`)                   |

Lägga till en bild för en ny film:

1. Spara originalet i `source-images/movies/`, t.ex. `ThorLoveAndThunder.webp`. Filnamnet blir bildnamnet `thor-love-and-thunder`.
2. Ange bildnamnet i databasen: `images` = `["thor-love-and-thunder"]`.
3. Kör `npm run scale-images` (sker också automatiskt vid `npm start` och `npm run build`).
4. Committa originalet.

## API

Alla endpoints nås via `/api` från frontend. 🔒 = kräver inloggning, 👑 = kräver admin.

| Resurs        | Endpoints                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/movies`     | `GET /`, `GET /current`, `GET /not-current`, `GET /age-rating/:ageRating`, `GET /age-rating/:ageRating/current`, `GET /:id`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id`       |
| `/showings`   | `GET /`, `GET /:id`, `GET /:id/seats`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id`                                                                                             |
| `/bookings`   | `POST /`, 🔒 `GET /me`, `GET /token/:token`, `PATCH /token/:token/cancel`, 👑 `GET /number/:bookingNumber`, 🔒 `GET /:id`, 🔒 `PATCH /:id/cancel`, 👑 `GET /`, 👑 `PATCH /:id` |
| `/users`      | `POST /auth/register`, `POST /auth/login`, 🔒 `GET /:id`, 🔒 `PATCH /:id`, 🔒 `DELETE /:id`, 👑 `GET /`                                                                           |
| `/events`     | `GET /`, `GET /:id`, `GET /:id/showings`, 👑 `POST /`, 👑 `PATCH /:id`, 👑 `DELETE /:id`                                                                                          |
| `/auditorium` | `GET /`, `GET /:id`                                                                                                                                                               |
| `/seats`      | `GET /`                                                                                                                                                                           |
| `/tickets`    | `GET /ticketTypes`                                                                                                                                                                |

## Gränssnittsdesign (Del 1)

Wireframes, klickbar prototyp, målgruppsbeskrivning, stilguide och tidsplan lämnas in separat som PDF i Omniway.

- Wireframes gjordes i Figma. Mockup och klickbar prototyp byggdes i HTML och Bootstrap.
- Tre målgrupper: familjen (barn 0–11 år och deras föräldrar), fandom (16–24 år) och nostalgikern (30–50 år).
- Tidsplanen följde kursens fem sprintar. Vi planerade user stories, tasks och frågor till produktägaren i en egen Excel-fil, som vi uppdaterade inför varje sprint.

## Arbetssätt

- Scrum med 5 sprintar (UX → Backend → MVP → Färdig produkt → Buggfix), en ny Scrum-master varje sprint
- Kanban-board i GitHub Projects, storleksbedömning med planning poker
- Daily standup, presentation av koden iför varje PR och retrospektiv efter varje sprint
- Stabilbranch `main`
- Utvecklingsbranch `dev-main`
- Varje uppgift har gjorts i en egen branch som skapats direkt i git project för enhetlig namngivning efter issue-numret, t.ex. `560-p24-readme`.
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
- Admin laddar upp affischen direkt när en ny film läggs in, och servern skalar den med Sharp
- Bygga ut adminportalen så att personalen själva kan lägga upp, ta bort och byta filmer, visningar och event.
- Bredare tema med fler superhjältefilmer för att passa alla målgrupper. 
- Trailers på egen server i stället för YouTube
- Sökfunktion för filmer
- Priser per visning tex premiärpris
- Statistikcookies kopplade till en riktig analystjänst
- Bokningsbekräftelse via mail innehåller QR eller biljetten i pdf så att besökarna kan ladda ner den till "plånboken" i sin mobil.

---

## Inloggning för bedömning

Inloggningsuppgifterna till admin och .env lämnas in separat i Omniway.


