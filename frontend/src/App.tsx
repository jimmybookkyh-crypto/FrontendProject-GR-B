import { Outlet, ScrollRestoration } from "react-router";
import Header from "./Partials/Header.tsx";
import Footer from "./Partials/Footer.tsx";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* Scrolls to the top on every page change, and restores the position on back/forward */}
      <ScrollRestoration />
    </>
  );
}
