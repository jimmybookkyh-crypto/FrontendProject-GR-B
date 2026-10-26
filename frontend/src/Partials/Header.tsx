import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import logo from "../assets/logo.png";
import "../styles/Header.css";

import { useAuth } from "../utils/authContext.tsx";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [omOssOpen, setOmOssOpen] = useState(false);

  const { user, loading, logout } = useAuth();

  /* Dator med mus: menyn öppnas vid hover och klick på Om oss går till sidan.
     Mobil/touch: klick öppnar menyn som vanligt. */
  const harHover = () =>
    window.matchMedia("(hover: hover) and (min-width: 992px)").matches;

  return (
    <Navbar expand="lg" sticky="top" className="fv-navbar" data-bs-theme="dark">
      <Navbar.Brand as={Link} to="/" className="fv-brand">
        <img src={logo} alt="FV – startsida" className="fv-logo" />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="fv-navbar-nav" />

      {!loading &&
        (user ? (
          <div className="fv-login">
            {/* Gul ring med ikon: går till Mina sidor (T126) */}
            <NavLink
              to="/mypage"
              className="fv-mypage-link"
              aria-label="Mina sidor"
              title="Mina sidor"
            >
              <svg
                className="fv-mypage-icon"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="23" fill="currentColor" />
                <circle cx="24" cy="18" r="7.5" fill="#100e1c" />
                <path
                  d="M11 37.5c2.4-6.6 7.3-9.8 13-9.8s10.6 3.2 13 9.8c-3.4 3.4-8 5.3-13 5.3s-9.6-1.9-13-5.3z"
                  fill="#100e1c"
                />
              </svg>
            </NavLink>

            <button
              type="button"
              className="fv-auth-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logga ut
            </button>
          </div>
        ) : (
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
        ))}

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
