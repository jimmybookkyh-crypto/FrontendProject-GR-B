import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useLocation } from "react-router";
import logo from "../assets/logo.png";
import "../styles/Header.css";

export default function Header() {
  const { pathname } = useLocation();
  const [omOssOpen, setOmOssOpen] = useState(false);

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
            onToggle={(isOpen) => setOmOssOpen(isOpen)}
          >
            <NavDropdown.Item as={Link} to="/about">
              Hitta till oss
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/about">
              Salonger
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/about">
              Snacks meny
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>

        <Link to="/login" className="fv-login">
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
          <span>Logga in</span>
        </Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
