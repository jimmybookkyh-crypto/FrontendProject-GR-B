import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink } from "react-router";
import logo from "../assets/logo.png";
import "../styles/Header.css";

export default function Header() {
  return (
    <Navbar expand="lg" className="fv-navbar" data-bs-theme="dark">
      <Navbar.Brand as={Link} to="/" className="fv-brand">
        <img src={logo} alt="FV – startsida" className="fv-logo" />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="fv-navbar-nav" />
      <Navbar.Collapse id="fv-navbar-nav">
        <Nav className="me-auto fv-nav">
          <Nav.Link as={NavLink} to="/" end className="fv-link">
            Hem
          </Nav.Link>
          <Nav.Link as={NavLink} to="/filmer" className="fv-link">
            Filmer
          </Nav.Link>
          <Nav.Link as={NavLink} to="/event" className="fv-link">
            Event
          </Nav.Link>

          <NavDropdown
            title="Om oss"
            id="om-oss-dropdown"
            className="fv-link fv-dropdown"
          >
            <NavDropdown.Item as={Link} to="/hitta-till-oss">
              Hitta till oss
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/salonger">
              Salonger
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/snacks-meny">
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
