import { Container, Row, Col, Figure } from "react-bootstrap";
import { Link } from "react-router";

import logo from "../assets/img/logo.png";

const linkStyle = { color: "#f5f7fa" };

export default function footer() {
  return (
    <footer
      className="border-secondary py-4 mt-auto"
      style={{ backgroundColor: "#100E1C" }}
    >
      <Container fluid className="px-md-5">
        <Row className="align-items-center">
          <Col
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <Link
                  to="/cookies"
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Om oss
                </Link>
              </li>
            </ul>
          </Col>

          <Col className="d-flex justify-content-center align-items-center">
            <Link
              to="/"
              className="d-flex align-items-center text-decoration-none"
              style={linkStyle}
            >
              <Figure className="mb-0">
                <Figure.Image
                  className="mb-0"
                  src={logo}
                  width={120}
                  height={100}
                  alt=""
                />
              </Figure>
              <h3 style={linkStyle}>FilmVisarna AB</h3>
            </Link>
          </Col>

          <Col
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <Link
                  to="/villkor"
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Villkor & policies
                </Link>
              </li>
              <li>
                <Link
                  to="/about#hitta-till-oss"
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Kontakta oss
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
