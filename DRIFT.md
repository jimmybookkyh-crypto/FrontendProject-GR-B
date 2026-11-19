# DRIFT.md

## Produktionsmiljö

Filmvisarna är driftsatt på gruppens egen server och nås via:

https://filmvisarna.se

Användarnamn, lösenord, IP-adress och SSH-port lagras inte i det här repot. De finns dokumenterade internt.

### Så hänger det ihop

| Del           | Beskrivning                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Server        | en VPS hos Contabo                                                                              |
| Ubuntu:       | operativsystemet                                                                                |
| Projektmapp   | `/var/www/FrontendProject-GR-B`                                                                 |
| Branch        | `main`                                                                                          |
| Process       | PM2-processen `backend`, som kör `npm run serve`                                                |
| Applikation   | Express serverar både API:t (`/api`), WebSocket och den byggda frontenden från `frontend/dist`  |
| Databas       | PostgreSQL på Supabase. Den ligger inte på servern utan nås via uppgifterna i `.env`            |
| Schemaläggare | Startar med servern och lägger till kommande visningar och eventperioder var tionde minut       |

---

## Miljövariabler

`.env` checkas aldrig in i git, utan ligger bara i projektmappen på servern. Mallen finns i `.env.example`.

På servern ska `APP_URL` vara `https://filmvisarna.se`, annars pekar länkarna i bekräftelsemejlen på `localhost`.

Efter en ändring i `.env` måste servern startas om:

```bash
pm2 restart backend
```

---

## Deployment

Vid uppdatering av produktionsmiljön:

```bash
ssh -p [SSH-PORT] [ANVÄNDARE]@[IP-ADRESS]

cd /var/www/FrontendProject-GR-B

git pull origin main

npm install

npm run build

pm2 restart backend
```

`npm run build` skalar bilderna från `source-images/`, typkontrollerar koden och bygger frontenden till `frontend/dist`. Om bygget misslyckas ligger den gamla versionen kvar. Starta då inte om PM2 förrän felet är rättat.

Kontrollera efteråt att allt fungerar:

```bash
pm2 list
pm2 logs backend --lines 50
```

Öppna sedan https://filmvisarna.se och testa startsidan och en bokning.

---

## PM2

Kontrollera status för applikationen:

```bash
pm2 list
```

Visa loggar:

```bash
pm2 logs backend
```

Visa de senaste raderna utan att följa loggen:

```bash
pm2 logs backend --lines 100 --nostream
```

Om processen saknas i `pm2 list`, starta den från projektmappen:

```bash
pm2 start npm --name backend -- run serve
pm2 save
```

Om PM2-konfigurationen ändras:

```bash
pm2 save
```

---

## Felsökning

### Applikationen är inte tillgänglig

Kontrollera först att processen körs:

```bash
pm2 list
```

Om status inte är `online`, läs loggarna och starta om:

```bash
pm2 logs backend --lines 100 --nostream
pm2 restart backend
```

### Applikationen kraschar

Granska loggarna:

```bash
pm2 logs backend
```

### HTTP 502 Bad Gateway

Det betyder oftast att applikationen inte svarar bakom webbservern.

Börja med att kontrollera loggarna:

```bash
pm2 logs backend
```

och verifiera att processen är igång:

```bash
pm2 list
```

### Sidan laddar men filmer och visningar saknas

Backend når troligen inte databasen. Kontrollera `POSTGRES_*` i `.env` och att Supabase-projektet är igång. Fel från databasen syns i `pm2 logs backend`.

### Bekräftelsemejl skickas inte

Kontrollera `SMTP_*` och `MAIL_FROM` i `.env`. Bokningen fungerar ändå även när mejlet inte går iväg.

### Bygget misslyckas

Läs felmeddelandet från `npm run build`. Rätta felet i koden lokalt, pusha till `main` och kör deployment-stegen igen.

---

## Viktigt

- Byt inte Node-version på servern utan att först verifiera kompatibilitet. Projektet kräver Node.js 20.11 eller senare.
- Kör alltid `pm2 save` efter ändringar i PM2-konfigurationen.
- Ändra inte kod direkt på servern. Gör ändringar via git, annars kan `git pull` stoppa på grund av konflikter.

---

## Kostnader och ägarskap

Server och domän är förbetalda ett år från projektets leveransdatum.