import { Outlet, ScrollRestoration } from "react-router";
import Header from "./Partials/Header.tsx";
import Footer from "./Partials/Footer.tsx";
import WelcomeMessage from "./components/WelcomeMessage.tsx";
import CookieBanner from "./components/CookieBanner.tsx";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <Header />
      <WelcomeMessage />
      <main>
        <Outlet />
        </main>
      <Footer />
      <CookieBanner />
        <ScrollRestoration />
    </>
  );
}
