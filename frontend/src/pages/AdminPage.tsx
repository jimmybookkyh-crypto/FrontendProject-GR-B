import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import RequireAuth from "../components/RequireAuth.tsx";
import "../styles/MyPage.css";

export default function AdminPage() {
  return (
    <RequireAuth role="admin">
      <div className="mypage">
        <Container className="py-4 py-lg-5">
          <header className="text-center mb-4 mb-lg-5">
            <h1 className="mypage-title">Adminportal</h1>
            <p className="mypage-greeting mb-0">
              Sök fram en bokning med bokningsnumret.
            </p>
          </header>

          <Row className="justify-content-center">
            <Col xs={12} lg={8}>
              <section className="mypage-panel">
                <h2 className="mypage-panel-title">Sök bokning</h2>
                             </section>
            </Col>
          </Row>
        </Container>
      </div>
    </RequireAuth>
  );
}

AdminPage.route = {
  path: "/admin",
  order: 0,
  label: "Admin",
};
