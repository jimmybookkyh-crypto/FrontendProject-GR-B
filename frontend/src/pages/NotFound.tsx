import { Link } from "react-router";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { paths, routes } from "../utils/paths.ts";
import "../styles/MyPage.css";

export default function NotFound() {
  return (
    <div className="mypage">
      <Container className="py-4 py-lg-5">
        <header className="text-center mb-4 mb-lg-5">
          <h1 className="mypage-title">Sidan finns inte</h1>
          <p className="mypage-greeting mb-0">
            Adressen kan vara felstavad, eller så har sidan flyttats.
          </p>
        </header>

        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <section className="mypage-panel mypage-empty text-center">
              <p>Gå till startsidan och hitta din film därifrån.</p>
              <Link to={paths.start} className="mypage-btn mypage-btn-red">
                Till startsidan
              </Link>
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

NotFound.route = {
  path: routes.notFound,
  order: 99,
  label: "Sidan finns inte",
};
