import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import logo from "../assets/logo.png";
import "../styles/Header.css";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [omOssOpen, setOmOssOpen] = useState(false);

  /* Dator med mus: menyn öppnas vid hover och klick på Om oss går till sidan.
     Mobil/touch: klick öppnar menyn som vanligt. */
  const harHover = () =>
    window.matchMedia("(hover: hover) and (min-width: 992px)").matches;

  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="fv-navbar"
      data-bs-theme="dark"
    >
      <Navbar.Brand as={Link} to="/" className="fv-brand">
        <img src={logo} alt="FV – startsida" className="fv-logo" />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="fv-navbar-nav" />
      <Link to="/login" className="fv-login" aria-label="Logga in">
        <svg
          className="fv-login-icon"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="21" />
          <circle cx="24" cy="18" r="7" />
          <path d="M9 38c3-7 8-10 15-10s12 3 15 10" />
        </svg>
        <span className="d-none d-lg-inline">Logga in</span>
      </Link>

      <Navbar.Collapse id="fv-navbar-nav">
        <Nav className={`me-auto fv-nav${omOssOpen ? " om-oss-open" : ""}`}>
          <Nav.Link as={NavLink} to="/" end className="fv-link">
            Hem
          </Nav.Link>
          <Nav.Link as={NavLink} to="/moviecatalog" className="fv-link">
            Filmer
          </Nav.Link>
          <Nav.Link as={NavLink} to="/event" className="fv-link">
            Event
          </Nav.Link>

          <NavDropdown
            title="Om oss"
            id="om-oss-dropdown"
            className="fv-link fv-dropdown"
            active={pathname.startsWith("/about")}
            show={omOssOpen}
            onMouseEnter={() => harHover() && setOmOssOpen(true)}
            onMouseLeave={() => harHover() && setOmOssOpen(false)}
            onToggle={(isOpen, meta) => {
              if (meta.source === "click" && harHover()) {
                setOmOssOpen(false);
                navigate("/about");
                return;
              }
              setOmOssOpen(isOpen);
            }}
          >
            <NavDropdown.Item as={Link} to="/about#hitta-till-oss">
              Hitta till oss
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/about#salonger">
              Salonger
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/about#snacks-meny">
              Snacks meny
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
