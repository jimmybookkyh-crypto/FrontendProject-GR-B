// Gör så att TypeScript känner igen Vite-specifika globala typer och funktioner, vilket möjliggör korrekt typkontroll och autokomplettering i projektet och slipper varningar om okända typer.
/// <reference types="vite/client" />

/* Vite tillhandahåller TypeScript-deklarationer för bland annat:
.png .jpg .jpeg .svg .webp, Import av CSS-filer samt vites egna miljövariabler via import.meta.env */