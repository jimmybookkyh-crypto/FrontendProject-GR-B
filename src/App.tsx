import { Outlet } from "react-router";
import Header from "./Partials/Header.tsx";

export default function App() {
  return (
    <>
       <Header /> 
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
}
