import { Container, Row, Col, Figure } from "react-bootstrap";
import { Link } from "react-router";
import logo from "../assets/logo.png";
import { paths } from "../utils/paths.ts";

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
                  to={paths.cookies}
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Cookies
                </Link>
              </li>
              <li>
                <Link
                  to={paths.about}
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
              to={paths.start}
              className="d-flex align-items-center text-decoration-none"
              style={linkStyle}
            >
              <Figure className="mb-0">
                <Figure.Image
                  className="mb-0"
                  src={logo}
                  width={72}
                  height={59}
                  alt=""
                />
              </Figure>
              <h3 style={linkStyle}>Filmvisarna AB</h3>
            </Link>
          </Col>

          <Col
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <Link
                  to={paths.terms}
                  className="text-decoration-none"
                  style={linkStyle}
                >
                  Villkor & policies
                </Link>
              </li>
              <li>
                <Link
                  to={`${paths.about}#hitta-till-oss`}
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
