# DRIFT.md

## Produktionsmiljö

Filmvisarna är driftsatt på gruppens egna server och nås via:

https://filmvisarna.se

Inloggningsuppgifter, IP-adress och SSH-port lagras inte i detta repository. Dessa finns dokumenterade internt.

---

## Deployment

Vid uppdatering av produktionsmiljön:

```bash
ssh -p [SSH-PORT] fe25@[IP-ADRESS]

cd /var/www/FrontendProject-GR-B

git pull

npm install

npm run build

pm2 restart filmvisarna
```

---

## PM2

Kontrollera status för applikationen:

```bash
pm2 list
```

Visa loggar:

```bash
pm2 logs
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

### Applikationen kraschar

Granska loggarna:

```bash
pm2 logs
```

### HTTP 502 Bad Gateway

Detta innebär vanligtvis att applikationen inte svarar bakom webbservern.

Börja med att kontrollera:

```bash
pm2 logs
```

och verifiera att processen är igång med:

```bash
pm2 list
```

---

## Viktigt

- Använd aldrig `sudo` på servern.
- Sex felaktiga lösenordsförsök leder till tillfällig spärr.
- Byt inte Node-version på servern utan att först verifiera kompatibilitet.
- Kör alltid `pm2 save` efter ändringar i PM2-konfigurationen.

---

## Kostnader och ägarskap

Server och domän är förbetalda ett år från projektets leveransdatum.
