import { Outlet } from "react-router";

import Footer from "./partials/Footer.tsx"

export default function App() {
  return (
    <>
      {/* <Header /> */}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
