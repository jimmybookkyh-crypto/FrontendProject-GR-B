import { Outlet, ScrollRestoration } from "react-router";
import Header from "./Partials/Header.tsx";
import Footer from "./Partials/Footer.tsx";
import CookieBanner from "./components/CookieBanner.tsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <ScrollRestoration />
    </>
  );
}
